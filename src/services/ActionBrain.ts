import { cambrianSeiAgent, SwapParams } from './CambrianSeiAgent'
import { privateKeyWallet } from './PrivateKeyWallet'
import { TokenScanner } from '../utils/tokenScanner'

// Intent Types for NLP Processing
export enum IntentType {
  TOKEN_SCAN = 'token_scan',
  TOKEN_CREATE = 'token_create',
  TOKEN_BURN = 'token_burn',
  LIQUIDITY_ADD = 'liquidity_add',
  BALANCE_CHECK = 'balance_check',
  CONVERSATION = 'conversation',
  PROTOCOL_DATA = 'protocol_data',
  TRADING_INFO = 'trading_info',
  HELP = 'help',
  UNKNOWN = 'unknown',
  // On-chain actions
  SYMPHONY_SWAP = 'symphony_swap',
  STAKE_TOKENS = 'stake_tokens',
  UNSTAKE_TOKENS = 'unstake_tokens',
  LEND_TOKENS = 'lend_tokens',
  BORROW_TOKENS = 'borrow_tokens',
  REPAY_LOAN = 'repay_loan',
  OPEN_POSITION = 'open_position',
  CLOSE_POSITION = 'close_position',
  GET_POSITIONS = 'get_positions',
  WALLET_INFO = 'wallet_info',
  // Token Transfer Operations
  SEND_TOKENS = 'send_tokens',
  TRANSFER_CONFIRMATION = 'transfer_confirmation',
  // NFT operations
  NFT_BROWSE = 'nft_browse',
  NFT_BUY = 'nft_buy',
  // TODOs
  TODO_ADD = 'todo_add',
  TODO_LIST = 'todo_list'
}

// Entity Extraction Results
interface ExtractedEntities {
  tokenAddress?: string
  tokenName?: string
  amount?: number
  seiAmount?: number
  tokenAmount?: number
  tokenIn?: string
  tokenOut?: string
  recipient?: string
  transferAmount?: number
}

// Intent Recognition Result
interface IntentResult {
  intent: IntentType
  confidence: number
  entities: ExtractedEntities
  rawMessage: string
}

// Action Response
interface ActionResponse {
  success: boolean
  response: string
  data?: any
  followUp?: string[]
}

export class ActionBrain {
  // Recognize intents with light NLP
  public async recognizeIntent(message: string): Promise<IntentResult> {
    const normalized = message.toLowerCase().trim()
    const entities: ExtractedEntities = {}

    // Extract address for scan
    const addrMatch = normalized.match(/0x[a-f0-9]{40}/i)
    if (addrMatch) entities.tokenAddress = addrMatch[0]

    // Extract simple amount
    const numMatch = normalized.match(/(\d+(?:\.\d+)?)/)
    if (numMatch) entities.amount = parseFloat(numMatch[1])

    // Wallet watch intents (trades/holdings)
    if ((/\blast(\s+\d+)?\s+trades?\b/.test(normalized) || /\blatest\s+trades?\b/.test(normalized)) && addrMatch) {
      return { intent: IntentType.PROTOCOL_DATA, confidence: 0.95, entities: { tokenAddress: addrMatch[0] } as any, rawMessage: message }
    }
    if (/\b(usdc\s+balance|holdings|portfolio)\b/.test(normalized) && addrMatch) {
      return { intent: IntentType.WALLET_INFO, confidence: 0.9, entities: { tokenAddress: addrMatch[0] } as any, rawMessage: message }
    }

    // Send/Transfer tokens
    if (/\b(send|transfer)\b/.test(normalized)) {
      const rec = normalized.match(/0x[a-f0-9]{40}/i)
      if (rec) entities.recipient = rec[0]
      const amt = normalized.match(/(\d+(?:\.\d+)?)/)
      if (amt) entities.transferAmount = parseFloat(amt[1])
      return { intent: IntentType.SEND_TOKENS, confidence: 0.9, entities, rawMessage: message }
    }

    // Swap intent (guard against 'last trade' queries)
    const mentionsTradeForSwap = /\b(swap|exchange|trade)\b/.test(normalized) && !/\blast\s+trades?|\blatest\s+trades?/.test(normalized)
    if (mentionsTradeForSwap) {
      // Minimal token resolution for SEI/USDC
      const usdc = (import.meta as any).env?.VITE_USDC_TESTNET || '0x948dff0c876EbEb1e233f9aF8Df81c23d4E068C6'
      if (/\bsei\b/.test(normalized) && /\busdc\b/.test(normalized)) {
        if (/sei\s*(for|to)\s*usdc/.test(normalized)) {
          entities.tokenIn = '0x0'
          entities.tokenOut = usdc
        } else if (/usdc\s*(for|to)\s*sei/.test(normalized)) {
          entities.tokenIn = usdc
          entities.tokenOut = '0x0'
        }
      }
      return { intent: IntentType.SYMPHONY_SWAP, confidence: 0.9, entities, rawMessage: message }
    }

    // Token creation
    if (/create\s+.*token/.test(normalized) || /make\s+.*token/.test(normalized)) {
      const name = this.extractTokenName(message)
      if (name) entities.tokenName = name
      return { intent: IntentType.TOKEN_CREATE, confidence: 0.9, entities, rawMessage: message }
    }

    // Balance
    if (/balance|how\s+much\s+sei|wallet/.test(normalized)) {
      return { intent: IntentType.BALANCE_CHECK, confidence: 0.8, entities, rawMessage: message }
    }

    // Token scan
    if (entities.tokenAddress) {
      return { intent: IntentType.TOKEN_SCAN, confidence: 0.95, entities, rawMessage: message }
    }

    // TODOs
    if (/(add|create|make).*\b(todo|task)\b/i.test(normalized)) {
      return { intent: IntentType.TODO_ADD, confidence: 0.9, entities, rawMessage: message }
    }
    if (/(what are we doing today|today'?s todo|my tasks|list todos|remind me|what do i want to do)/i.test(normalized)) {
      return { intent: IntentType.TODO_LIST, confidence: 0.9, entities, rawMessage: message }
    }

    // Conversation fallback
    if (/(hello|hi|hey|help|what can you do)/i.test(normalized)) {
      return { intent: IntentType.CONVERSATION, confidence: 0.7, entities, rawMessage: message }
    }

    return { intent: IntentType.UNKNOWN, confidence: 0.1, entities, rawMessage: message }
  }

  // Execute action
  public async executeAction(intentResult: IntentResult): Promise<ActionResponse> {
    try {
      switch (intentResult.intent) {
        case IntentType.SYMPHONY_SWAP:
          return await this.executeSymphonySwap(intentResult)
        case IntentType.TOKEN_CREATE:
          return await this.executeTokenCreate(intentResult)
        case IntentType.TOKEN_SCAN:
          return await this.executeTokenScan(intentResult)
        case IntentType.BALANCE_CHECK:
          return await this.executeBalanceCheck(intentResult)
        case IntentType.SEND_TOKENS:
          return await this.executeSendTokens(intentResult)
        case IntentType.TODO_ADD:
          return this.executeTodoAdd(intentResult)
        case IntentType.TODO_LIST:
          return this.executeTodoList(intentResult)
        case IntentType.WALLET_INFO:
          return await this.executeWalletWatch(intentResult.rawMessage)
        case IntentType.PROTOCOL_DATA:
          return await this.executeWalletWatch(intentResult.rawMessage)
        case IntentType.CONVERSATION:
          return this.executeConversation(intentResult)
        default:
          return this.executeUnknown(intentResult)
      }
    } catch (error: any) {
      return { success: false, response: `❌ Action failed: ${error.message || String(error)}` }
    }
  }

  // Swap: quote → confirm (pendingSwap)
  private async executeSymphonySwap(intent: IntentResult): Promise<ActionResponse> {
    const { amount, tokenIn, tokenOut, seiAmount, tokenAmount } = intent.entities as any
    if (!tokenIn || !tokenOut) {
      return { success: false, response: `🔄 Please specify both input and output tokens. Example: "Swap 10 SEI to USDC"` }
    }
    const effectiveAmount = (amount ?? seiAmount ?? tokenAmount) as number | undefined
    if (!effectiveAmount || !isFinite(effectiveAmount) || effectiveAmount <= 0) {
      return { success: false, response: `❌ Missing or invalid amount. Example: "Swap 10 SEI to USDC"` }
    }
    const quote = await cambrianSeiAgent.getSwapQuote({ tokenIn: tokenIn as any, tokenOut: tokenOut as any, amount: `${effectiveAmount}` })
    const out = Number(quote?.outputAmount || 0)
    if (!quote || !isFinite(out) || out <= 0) {
      // Fallback: fixed-rate serverless for SEI->USDC
      try {
        const usdc = (import.meta as any).env?.VITE_USDC_TESTNET || '0x948dff0c876EbEb1e233f9aF8Df81c23d4E068C6'
        const nativeIn = String(tokenIn).toLowerCase() === '0x0'
        const isUsdcOut = String(tokenOut).toLowerCase() === usdc.toLowerCase()
        if (nativeIn && isUsdcOut) {
          const res = await fetch('/.netlify/functions/swap-fixed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'quote', seiAmount: `${effectiveAmount}` }) })
          if (res.ok) {
            const data = await res.json() as any
            const outUsdc = Number(data?.outUsdc || 0)
            if (outUsdc > 0) {
              const minOut = (outUsdc * 0.99).toString()
              return {
                success: true,
                response: `✅ Quote\n• In: ${effectiveAmount} SEI\n• Expected Out: ${outUsdc} USDC\n• Min Out (@1%): ${minOut}\n\nSay "Yes" to execute or "Cancel" to abort.`,
                data: { pendingSwap: { amount: `${effectiveAmount}`, tokenIn, tokenOut, minOut } }
              }
            }
          }
        }
        // USDC -> SEI fallback
        const nativeOut = String(tokenOut).toLowerCase() === '0x0'
        const isUsdcIn = String(tokenIn).toLowerCase() === usdc.toLowerCase()
        if (nativeOut && isUsdcIn) {
          const res2 = await fetch('/.netlify/functions/swap-fixed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'quote', usdcAmount: `${effectiveAmount}` }) })
          if (res2.ok) {
            const data2 = await res2.json() as any
            const outSei = Number(data2?.outSei || 0)
            if (outSei > 0) {
              const minOut = (outSei * 0.99).toString()
              return {
                success: true,
                response: `✅ Quote\n• In: ${effectiveAmount} USDC\n• Expected Out: ${outSei} SEI\n• Min Out (@1%): ${minOut}\n\nSay "Yes" to execute or "Cancel" to abort.`,
                data: { pendingSwap: { amount: `${effectiveAmount}`, tokenIn, tokenOut, minOut } }
              }
            }
          }
        }
      } catch {}
      return { success: false, response: `❌ No liquidity or route found for this pair/amount on current router. Try a smaller amount or different pair.` }
    }
    const priceImpact = Number(quote.priceImpact || 0)
    if (isFinite(priceImpact) && priceImpact > 5) {
      return { success: false, response: `🚫 High price impact (${priceImpact.toFixed(2)}%). Try a smaller amount or different pair.` }
    }
    const slippageBps = 100
    const minOut = (out * (1 - slippageBps / 10_000)).toString()
    const displayToken = (addr: string) => addr === '0x0' ? 'WSEI' : addr
    return {
      success: true,
      response: `✅ Quote\n• In: ${effectiveAmount} ${displayToken(tokenIn as any)}\n• Expected Out: ${out}\n• Impact: ${isFinite(priceImpact) ? priceImpact.toFixed(2) : '0.00'}%\n• Min Out (@1%): ${minOut}\n\nSay "Yes" to execute or "Cancel" to abort.`,
      data: { pendingSwap: { amount: `${effectiveAmount}`, tokenIn, tokenOut, minOut } }
    }
  }

  // Token creation via factory (reads creationFee and simulates inside agent)
  private async executeTokenCreate(intent: IntentResult): Promise<ActionResponse> {
    const name = intent.entities.tokenName || this.extractTokenName(intent.rawMessage)
    if (!name) return { success: false, response: `🚀 Token Creation\nUsage: "Create a token called MyToken"` }

    // Conversational wizard via quick comma format support
    const comma = intent.rawMessage.split(':')[1] || ''
    const parts = comma.split(',').map(s => s.trim()).filter(Boolean)
    // Defaults similar to Seilist
    const defaults = {
      totalSupply: '1000000',
      website: '',
      twitter: '',
      lockUsd: '0'
    }
    if (parts.length >= 1 && /^\d/.test(parts[0])) defaults.totalSupply = String(Math.max(1, parseInt(parts[0] || '1000000')))
    if (parts.length >= 2) defaults.lockUsd = parts[1]
    if (parts.length >= 3) defaults.website = parts[2]
    if (parts.length >= 4) defaults.twitter = parts[3]

    const symbol = name.substring(0, 5).toUpperCase()
    try {
      const { txHash } = await cambrianSeiAgent.createToken({ name, symbol, totalSupply: defaults.totalSupply })
      const followUps: string[] = []
      if (!defaults.website || !defaults.twitter) {
        followUps.push('Provide: total supply, lock USD, website, twitter (comma-separated) to update metadata later.')
      }
      return { success: true, response: `✅ Token Created\n• Name: ${name}\n• Symbol: ${symbol}\n• Supply: ${parseInt(defaults.totalSupply).toLocaleString()}\n• Tx: \`${txHash}\``, followUp: followUps }
    } catch (e: any) {
      return { success: false, response: `❌ Creation Failed: ${e.message || String(e)}` }
    }
  }

  // Token scan
  private async executeTokenScan(intent: IntentResult): Promise<ActionResponse> {
    const addr = intent.entities.tokenAddress
    if (!addr) return { success: false, response: `❌ No valid token address found (0x...)` }
    try {
      const scanner = new TokenScanner()
      const analysis = await scanner.analyzeToken(addr)
      const name = analysis.basicInfo.name
      const symbol = analysis.basicInfo.symbol
      const price = analysis.basicInfo.marketData?.price
      const risk = analysis.riskScore
      let resp = `🔍 Token Scan\n**Token**: ${name} (${symbol})\n**Contract**: \`${addr}\`\n`
      if (price !== undefined) resp += `**Price**: $${scanner.formatNumber(price)}\n`
      resp += `**Safety Score**: ${risk}/100`
      return { success: true, response: resp, data: { analysis } }
    } catch (e: any) {
      return { success: false, response: `❌ Scan Failed: ${e.message || String(e)}` }
    }
  }

  // Balance
  private async executeBalanceCheck(_intent: IntentResult): Promise<ActionResponse> {
    const bal = await privateKeyWallet.getSeiBalance()
    let response = `💰 Wallet Balance\n• Amount: ${bal.sei} SEI\n• USD Value: $${bal.usd.toFixed(2)}\n• Address: \`${privateKeyWallet.getAddress()}\``
    return { success: true, response, data: { balance: bal } }
  }

  // Wallet watch (trades/holdings/USDC) via serverless endpoints
  private async executeWalletWatch(message: string): Promise<ActionResponse> {
    const addr = (message.match(/0x[a-f0-9]{40}/i)?.[0] || '')
    if (!addr) return { success: false, response: 'Provide a wallet address (0x...)' }
    // Detect network or default to mainnet if omitted
    const wantsMainnet = /\bmainnet\b/.test(message.toLowerCase())
    const wantsTestnet = /\btestnet\b/.test(message.toLowerCase())
    const network = wantsMainnet ? 'mainnet' : wantsTestnet ? 'testnet' : 'mainnet'
    // Parse hours window like 'last 24 hours'
    const hoursMatch = message.toLowerCase().match(/last\s+(\d{1,3})\s*hours?/) 
    const hours = hoursMatch ? Math.min(168, Math.max(1, parseInt(hoursMatch[1]||'24'))) : undefined
    try {
      if (/\blast\s+(ten|10)\s+trades?\b/.test(message.toLowerCase()) || /\blatest\s+trades?\b/.test(message.toLowerCase()) || hours) {
        const limit = /\b10\b/.test(message) || /ten/.test(message.toLowerCase()) ? 10 : (hours ? 100 : 1)
        const res = await fetch('/.netlify/functions/wallet-interactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: addr, network, limit, includeNative: true, nativeBlocks: 800, hours }) })
        if (!res.ok) return { success: false, response: `Failed to fetch trades: ${await res.text()}` }
        const data = await res.json() as any
        const erc = (data.transfers || []) as any[]
        const nat = (data.native || []) as any[]
        const combined = [...erc.map((t:any)=>({ type:'erc20', ...t })), ...nat.map((n:any)=>({ type:'native', ...n }))].sort((a:any,b:any)=> (b.blockNumber||0)-(a.blockNumber||0)).slice(0, limit)
        if (!combined.length) return { success: true, response: `No recent trades found for ${addr} on ${network}${hours?` in last ${hours}h`:''}.` }
        const lines = combined.map((t:any,i:number)=> t.type==='native' ? `${i+1}. Native ${Number(t.value).toFixed(4)} SEI ${t.from?.toLowerCase()===addr.toLowerCase()?'➡️':'⬅️'} ${t.to} [${t.txHash.slice(0,8)}...]` : `${i+1}. ERC20 ${t.amount} @ ${t.token} ${t.from?.toLowerCase()===addr.toLowerCase()?'➡️':'⬅️'} ${t.to} [${t.txHash.slice(0,8)}...]`)
        return { success: true, response: `🧾 Recent ${combined.length} transfer(s) for ${addr} on ${network}${hours?` (last ${hours}h)`:''}\n${lines.join('\n')}`, data }
      }
      const portfolio = await fetch('/.netlify/functions/wallet-portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: addr, network, includeSymbols: ['SEI','USDC'] }) }).then(r=>r.json())
      const native = portfolio?.native?.balance ?? 0
      const usdc = (portfolio?.tokens || []).find((t:any)=>String(t.symbol||'').toUpperCase()==='USDC')?.balance ?? 0
      return { success: true, response: `👛 Wallet ${addr}\n• Network: ${network}\n• SEI: ${native}\n• USDC: ${usdc}`, data: { portfolio } }
    } catch (e:any) {
      return { success: false, response: `Failed to fetch wallet info: ${e.message||e}` }
    }
  }

  // Transfer confirmation setup (ChatBrain will execute on Yes)
  private async executeSendTokens(intent: IntentResult): Promise<ActionResponse> {
    const { transferAmount, recipient } = intent.entities
    if (!transferAmount || !recipient) {
      return { success: false, response: `❌ Missing transfer details. Usage: "Send 0.1 SEI to 0x..."` }
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return { success: false, response: `❌ Invalid recipient address: ${recipient}` }
    }
    const normalized = intent.rawMessage.toLowerCase()
    const usdcAddr = (import.meta as any).env?.VITE_USDC_TESTNET || '0x948dff0c876EbEb1e233f9aF8Df81c23d4E068C6'
    const isUsdc = /\busdc\b/.test(normalized)
    if (isUsdc) {
      const currentUSDC = (await privateKeyWallet.getUSDCBalance()).balance
      const remainingUSDC = (parseFloat(currentUSDC) - transferAmount).toFixed(2)
      return {
        success: true,
        response: `💸 Transfer Confirmation Required (USDC)\n• Amount: ${transferAmount} USDC\n• Recipient: ${recipient}\n• Current: ${currentUSDC} USDC\n• After: ${remainingUSDC} USDC\n\nReply: "Yes" to confirm or "Cancel"`,
        data: { pendingTransfer: { amount: transferAmount, recipient, currentBalance: currentUSDC, remainingBalance: remainingUSDC, token: usdcAddr } as any }
      }
    }
    const currentBalance = (await privateKeyWallet.getSeiBalance()).sei
    const remainingBalance = (parseFloat(currentBalance) - transferAmount).toFixed(4)
    return {
      success: true,
      response: `💸 Transfer Confirmation Required\n• Amount: ${transferAmount} SEI\n• Recipient: ${recipient}\n• Current: ${currentBalance} SEI\n• After: ${remainingBalance} SEI\n\nReply: "Yes" to confirm or "Cancel"`,
      data: { pendingTransfer: { amount: transferAmount, recipient, currentBalance, remainingBalance } }
    }
  }

  // TODOs minimal
  private executeTodoAdd(intent: IntentResult): ActionResponse {
    const task = intent.rawMessage.replace(/add|create|make|todo|task|remind me to/gi, '').replace(/\s+/g,' ').trim()
    if (!task) {
      return { success: true, response: '📝 What should I add to your TODOs? You can say: "Remind me to check liquidity at 5pm"' }
    }
    const todos = JSON.parse(localStorage.getItem('seilor_todos') || '[]')
    todos.unshift({ task, createdAt: new Date().toISOString(), completed: false })
    localStorage.setItem('seilor_todos', JSON.stringify(todos))
    return { success: true, response: `✅ Added to your todo: ${task}` }
  }

  private executeTodoList(_intent: IntentResult): ActionResponse {
    const todos = JSON.parse(localStorage.getItem('seilor_todos') || '[]')
    if (!todos.length) return { success: true, response: '📝 No todos yet.' }
    const lines = todos.slice(0, 10).map((t: any, i: number) => `${i + 1}. ${t.completed ? '✅ ' : ''}${t.task}`)
    return { success: true, response: `📝 Your Todos\n${lines.join('\n')}` }
  }

  // Conversation/Unknown
  private executeConversation(_intent: IntentResult): ActionResponse {
    return { success: true, response: `👋 I can scan tokens, create tokens, swap, check balances, and transfer SEI. Tell me what you'd like to do.` }
  }

  private executeUnknown(_intent: IntentResult): ActionResponse {
    return { success: true, response: `I'm here to help. Try: "Scan 0x...", "Create a token called BlueFox", "Swap 10 SEI to USDC", or "Send 0.1 SEI to 0x..."` }
  }

  // Helpers
  private extractTokenName(message: string): string | undefined {
    const patterns = [
      /create.*token.*called\s+([a-zA-Z0-9\s]+)/i,
      /create\s+([a-zA-Z0-9\s]+)\s+token/i,
      /make.*token.*named\s+([a-zA-Z0-9\s]+)/i,
      /new.*token.*called\s+([a-zA-Z0-9\s]+)/i
    ]
    for (const p of patterns) {
      const m = message.match(p)
      if (m) return m[1].trim()
    }
    return undefined
  }
}

export const actionBrain = new ActionBrain()

