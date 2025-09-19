import type { Handler } from '@netlify/functions'

// Minimal shape the client should send
type RiskInput = {
  tokenAddress: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const { tokenAddress } = JSON.parse(event.body || '{}') as RiskInput
    if (!tokenAddress || typeof tokenAddress !== 'string') return { statusCode: 400, body: 'Missing tokenAddress' }

    // Call existing SafeChecker serverless endpoints if any, or reuse utilities via a lightweight proxy
    // Here, we call an internal endpoint that your app provides (adjust route if needed)
    const res = await fetch(process.env.URL ? `${process.env.URL}/.netlify/functions/wallet-portfolio` : 'http://localhost:8888/.netlify/functions/wallet-portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: '0x0', network: 'testnet', includeSymbols: ['SEI'] })
    }).catch(() => null)

    // Placeholder aggregation: in production, import and run the same logic used by TokenScanner
    // Since Netlify functions are isolated, mirror a minimal risk response shape for now
    const risk = {
      address: tokenAddress,
      riskLevel: 'MEDIUM',
      securityScore: 65,
      warnings: [
        'Ownership not renounced',
        'Top holder concentration > 20%'
      ]
    }

    return { statusCode: 200, body: JSON.stringify(risk) }
  } catch (err: any) {
    return { statusCode: 500, body: `Error: ${err.message}` }
  }
}

