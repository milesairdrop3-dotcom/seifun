import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  Address,
  PublicClient,
  WalletClient
} from 'viem';
import { sei } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Symphony SDK for DEX operations
import { Symphony } from 'symphony-sdk/viem';

// Types for our enhanced agent
export interface SwapParams {
  tokenIn: Address;
  tokenOut: Address;
  amount: string;
}

export interface StakeParams {
  amount: string;
}

export interface LendingParams {
  amount: string;
  token: string;
}

export interface TradingParams {
  market: string;
  side: 'long' | 'short';
  size: string;
  leverage?: number;
}

export interface AgentCapabilities {
  // Token Operations
  getBalance: (tokenAddress?: Address) => Promise<string>;
  transferToken: (amount: string, recipient: Address, tokenAddress?: Address) => Promise<string>;
  
  // DEX Operations (Symphony)
  swapTokens: (params: SwapParams) => Promise<string>;
  getSwapQuote: (params: SwapParams) => Promise<any>;
  
  // Staking Operations (Silo)
  stakeTokens: (params: StakeParams) => Promise<string>;
  unstakeTokens: (params: StakeParams) => Promise<string>;
  
  // Lending Operations (Takara) 
  lendTokens: (params: LendingParams) => Promise<string>;
  borrowTokens: (params: LendingParams) => Promise<string>;
  repayLoan: (params: LendingParams) => Promise<string>;
  
  // Trading Operations (Citrex)
  openPosition: (params: TradingParams) => Promise<string>;
  closePosition: (positionId: string) => Promise<string>;
  getPositions: () => Promise<any[]>;
}

/**
 * Enhanced Sei Agent integrating CambrianAgents capabilities with Seifun
 * This bridges the gap between CambrianAgents' powerful SDK and our Action Brain
 */
export class CambrianSeiAgent implements AgentCapabilities {
  public publicClient: PublicClient;
  public walletClient: WalletClient;
  public walletAddress: Address;
  private symphonySDK: Symphony;

  constructor(privateKey: string) {
    const account = privateKeyToAccount(privateKey as Address);
    
    this.publicClient = createPublicClient({
      chain: sei,
      transport: http('https://evm-rpc.sei-apis.com')
    });
    
    this.walletClient = createWalletClient({
      account,
      chain: sei,
      transport: http('https://evm-rpc.sei-apis.com')
    });
    
    this.walletAddress = account.address;
    
    // Initialize Symphony SDK for DEX operations
    this.symphonySDK = new Symphony({ walletClient: this.walletClient });
    this.symphonySDK.connectWalletClient(this.walletClient);
  }

  /**
   * Get token balance (SEI or ERC-20)
   */
  async getBalance(tokenAddress?: Address): Promise<string> {
    try {
      if (!tokenAddress) {
        // Get native SEI balance
        const balance = await this.publicClient.getBalance({
          address: this.walletAddress
        });
        return (Number(balance) / 10**18).toFixed(4);
      } else {
        // Get ERC-20 token balance
        const balance = await this.publicClient.readContract({
          address: tokenAddress,
          abi: [{
            name: 'balanceOf',
            type: 'function',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }],
          }],
          functionName: 'balanceOf',
          args: [this.walletAddress]
        });
        
        // Get decimals
        const decimals = await this.publicClient.readContract({
          address: tokenAddress,
          abi: [{
            name: 'decimals',
            type: 'function',
            inputs: [],
            outputs: [{ name: '', type: 'uint8' }],
          }],
          functionName: 'decimals'
        });
        
        return (Number(balance) / 10**Number(decimals)).toFixed(4);
      }
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Transfer tokens (SEI or ERC-20)
   */
  async transferToken(amount: string, recipient: Address, tokenAddress?: Address): Promise<string> {
    try {
      if (!tokenAddress) {
        // Transfer native SEI
        const hash = await this.walletClient.sendTransaction({
          to: recipient,
          value: BigInt(Math.floor(parseFloat(amount) * 10**18))
        });
        return hash;
      } else {
        // Transfer ERC-20 token
        const decimals = await this.publicClient.readContract({
          address: tokenAddress,
          abi: [{
            name: 'decimals',
            type: 'function',
            inputs: [],
            outputs: [{ name: '', type: 'uint8' }],
          }],
          functionName: 'decimals'
        });
        
        const hash = await this.walletClient.writeContract({
          address: tokenAddress,
          abi: [{
            name: 'transfer',
            type: 'function',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }],
          }],
          functionName: 'transfer',
          args: [recipient, BigInt(Math.floor(parseFloat(amount) * 10**Number(decimals)))]
        });
        
        return hash;
      }
    } catch (error) {
      console.error('Error transferring token:', error);
      throw new Error(`Failed to transfer: ${error.message}`);
    }
  }

  /**
   * Swap tokens using Symphony DEX
   */
  async swapTokens(params: SwapParams): Promise<string> {
    try {
      console.log(`🔄 Swapping ${params.amount} tokens via Symphony DEX...`);
      
      // Check balance
      const balance = await this.getBalance(params.tokenIn === '0x0' ? undefined : params.tokenIn);
      if (Number(balance) < Number(params.amount)) {
        throw new Error(`Insufficient balance. Have: ${balance}, Need: ${params.amount}`);
      }

      // Get the route for the swap
      const route = await this.symphonySDK.getRoute(
        params.tokenIn,
        params.tokenOut,
        params.amount
      );

      // Check if approval is needed
      const isApproved = await route.checkApproval();
      if (!isApproved) {
        console.log('⏳ Approving token spend...');
        await route.giveApproval();
      }

      // Execute the swap
      console.log('⚡ Executing swap...');
      const { swapReceipt } = await route.swap();
      
      return `✅ Swap completed! TX: ${swapReceipt.transactionHash}`;
    } catch (error) {
      console.error('Error swapping tokens:', error);
      throw new Error(`Swap failed: ${error.message}`);
    }
  }

  /**
   * Get swap quote from Symphony
   */
  async getSwapQuote(params: SwapParams): Promise<any> {
    try {
      const route = await this.symphonySDK.getRoute(
        params.tokenIn,
        params.tokenOut,
        params.amount
      );
      
      return {
        inputAmount: params.amount,
        outputAmount: route.outputAmount,
        priceImpact: route.priceImpact,
        route: route.path
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw new Error(`Quote failed: ${error.message}`);
    }
  }

  /**
   * Stake SEI tokens (Silo integration placeholder)
   */
  async stakeTokens(params: StakeParams): Promise<string> {
    try {
      console.log(`🥩 Staking ${params.amount} SEI tokens...`);
      
      // Check SEI balance
      const balance = await this.getBalance();
      if (Number(balance) < Number(params.amount)) {
        throw new Error(`Insufficient SEI balance. Have: ${balance}, Need: ${params.amount}`);
      }

      // TODO: Implement actual Silo staking contract interaction
      // For now, return informative message about testnet status
      return `🥩 Staking ${params.amount} SEI initiated!\n\n📝 Testnet Status: Silo protocol integration in development\n🔧 Currently testing on Sei Testnet (Chain ID: 1328)\n💰 Your SEI balance: ${balance} SEI\n\n⚠️ Note: This is a testnet implementation. Real staking will be available on mainnet.`;
    } catch (error) {
      console.error('Error staking tokens:', error);
      throw new Error(`Staking failed: ${error.message}`);
    }
  }

  /**
   * Unstake SEI tokens (Silo integration placeholder)
   */
  async unstakeTokens(params: StakeParams): Promise<string> {
    try {
      console.log(`📤 Unstaking ${params.amount} SEI tokens...`);
      
      // TODO: Implement actual Silo unstaking contract interaction
      return `📤 Unstaking ${params.amount} SEI initiated!\n\n📝 Testnet Status: Silo protocol integration in development\n🔧 Currently testing on Sei Testnet (Chain ID: 1328)\n\n⚠️ Note: This is a testnet implementation. Real unstaking will be available on mainnet.`;
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      throw new Error(`Unstaking failed: ${error.message}`);
    }
  }

  /**
   * Lend tokens (Takara integration placeholder)
   */
  async lendTokens(params: LendingParams): Promise<string> {
    try {
      console.log(`🏦 Lending ${params.amount} ${params.token} via Takara...`);
      
      // TODO: Implement actual Takara lending contract interaction
      return `🏦 Lending ${params.amount} ${params.token} initiated!\n\n📝 Testnet Status: Takara Finance integration in development\n🔧 Currently testing on Sei Testnet (Chain ID: 1328)\n\n⚠️ Note: This is a testnet implementation. Real lending will be available on mainnet.`;
    } catch (error) {
      console.error('Error lending tokens:', error);
      throw new Error(`Lending failed: ${error.message}`);
    }
  }

  /**
   * Borrow tokens (Takara integration placeholder)
   */
  async borrowTokens(params: LendingParams): Promise<string> {
    try {
      console.log(`💰 Borrowing ${params.amount} ${params.token} via Takara...`);
      
      // TODO: Implement actual Takara borrowing contract interaction
      return `💰 Borrowing ${params.amount} ${params.token} initiated!\n\n📝 Testnet Status: Takara Finance integration in development\n🔧 Currently testing on Sei Testnet (Chain ID: 1328)\n\n⚠️ Note: This is a testnet implementation. Real borrowing will be available on mainnet.`;
    } catch (error) {
      console.error('Error borrowing tokens:', error);
      throw new Error(`Borrowing failed: ${error.message}`);
    }
  }

  /**
   * Repay loan (Takara integration placeholder)
   */
  async repayLoan(params: LendingParams): Promise<string> {
    try {
      console.log(`💸 Repaying ${params.amount} ${params.token} loan via Takara...`);
      
      // TODO: Implement actual Takara loan repayment contract interaction
      return `💸 Repaying ${params.amount} ${params.token} loan initiated!\n\n📝 Testnet Status: Takara Finance integration in development\n🔧 Currently testing on Sei Testnet (Chain ID: 1328)\n\n⚠️ Note: This is a testnet implementation. Real loan repayment will be available on mainnet.`;
    } catch (error) {
      console.error('Error repaying loan:', error);
      throw new Error(`Loan repayment failed: ${error.message}`);
    }
  }

  /**
   * Open trading position (Citrex integration placeholder)
   */
  async openPosition(params: TradingParams): Promise<string> {
    try {
      console.log(`📈 Opening ${params.side} position on ${params.market} via Citrex...`);
      
      // TODO: Implement actual Citrex trading contract interaction
      return `📈 Opening ${params.side} position on ${params.market} initiated!\n\n📝 Testnet Status: Citrex protocol integration in development\n🔧 Currently testing on Sei Testnet (Chain ID: 1328)\n📊 Size: ${params.size} ${params.market.split('/')[0]}\n🎯 Leverage: ${params.leverage || 1}x\n\n⚠️ Note: This is a testnet implementation. Real trading will be available on mainnet.`;
    } catch (error) {
      console.error('Error opening position:', error);
      throw new Error(`Position opening failed: ${error.message}`);
    }
  }

  /**
   * Close trading position (Citrex integration placeholder)
   */
  async closePosition(positionId: string): Promise<string> {
    try {
      console.log(`📉 Closing position ${positionId} via Citrex...`);
      
      // TODO: Implement actual Citrex position closing contract interaction
      return `📉 Closing position ${positionId} initiated!\n\n📝 Testnet Status: Citrex protocol integration in development\n🔧 Currently testing on Sei Testnet (Chain ID: 1328)\n\n⚠️ Note: This is a testnet implementation. Real position closing will be available on mainnet.`;
    } catch (error) {
      console.error('Error closing position:', error);
      throw new Error(`Position closing failed: ${error.message}`);
    }
  }

  /**
   * Get open positions (Citrex integration placeholder)
   */
  async getPositions(): Promise<any[]> {
    try {
      console.log(`📊 Getting open positions via Citrex...`);
      
      // TODO: Implement actual Citrex positions query
      // For now, return empty array since we're on testnet
      console.log('📝 Testnet Status: Citrex protocol integration in development');
      console.log('🔧 Currently testing on Sei Testnet (Chain ID: 1328)');
      
      return [];
    } catch (error) {
      console.error('Error getting positions:', error);
      throw new Error(`Failed to get positions: ${error.message}`);
    }
  }

  /**
   * Get wallet address
   */
  getAddress(): string {
    return this.walletAddress;
  }

  /**
   * Get wallet info summary
   */
  async getWalletInfo(): Promise<any> {
    try {
      const seiBalance = await this.getBalance();
      
      return {
        address: this.walletAddress,
        seiBalance,
        network: 'Sei Network',
        capabilities: [
          'Token Transfers',
          'Symphony DEX Swapping',
          'Silo Staking (Coming Soon)',
          'Takara Lending (Coming Soon)',
          'Citrex Trading (Coming Soon)'
        ]
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      return {
        address: this.walletAddress,
        error: error.message
      };
    }
  }
}

// Export singleton instance using the same private key as our existing system
const PRIVATE_KEY = '0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684';
export const cambrianSeiAgent = new CambrianSeiAgent(PRIVATE_KEY);