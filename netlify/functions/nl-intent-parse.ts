import type { Handler } from '@netlify/functions'

type ExecutionMode = 'preview' | 'execute' | 'auto'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY

const functionSchema = {
  name: 'build_swap_plan',
  description: 'Extract structured fields for a swap or liquidity intent',
  parameters: {
    type: 'object',
    properties: {
      intent: { type: 'string', description: 'swap | add_liquidity | remove_liquidity' },
      fromToken: { type: 'string' },
      toToken: { type: 'string' },
      amount: { type: 'string', description: 'human readable amount, e.g. 0.2' },
      maxSlippagePct: { type: 'number', description: 'percentage, e.g. 0.5 for 0.5%' },
      preferredDex: { type: 'string' },
      executionMode: { type: 'string', enum: ['preview','execute','auto'] as ExecutionMode[] },
      gasPreference: { type: 'string', description: 'economy | balanced | fast' }
    },
    required: ['intent','amount']
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  if (!OPENAI_API_KEY) return { statusCode: 500, body: 'Missing OPENAI_API_KEY' }
  try {
    const { message } = JSON.parse(event.body || '{}') as { message?: string }
    if (!message || typeof message !== 'string') return { statusCode: 400, body: 'Missing message' }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You extract strict JSON for swap/liquidity intents on Sei. Do not guess addresses.' },
          { role: 'user', content: message }
        ],
        functions: [functionSchema],
        function_call: { name: 'build_swap_plan' },
        temperature: 0.2
      })
    })
    if (!res.ok) return { statusCode: 500, body: await res.text() }
    const data = await res.json()
    const tool = data?.choices?.[0]?.message?.function_call
    let parsed: any = {}
    try { parsed = JSON.parse(tool?.arguments || '{}') } catch {}

    // Deterministic light validator
    const out = {
      intent: String(parsed.intent || '').toLowerCase(),
      fromToken: parsed.fromToken || null,
      toToken: parsed.toToken || null,
      amount: String(parsed.amount || ''),
      maxSlippagePct: Number.isFinite(parsed.maxSlippagePct) ? Number(parsed.maxSlippagePct) : 0.5,
      preferredDex: parsed.preferredDex || 'DragonSwap',
      executionMode: ['preview','execute','auto'].includes(parsed.executionMode) ? parsed.executionMode : 'preview',
      gasPreference: parsed.gasPreference || 'balanced'
    }

    if (!out.intent || !out.amount) return { statusCode: 422, body: 'Unable to parse intent' }

    return { statusCode: 200, body: JSON.stringify(out) }
  } catch (err: any) {
    return { statusCode: 500, body: `Error: ${err.message}` }
  }
}

