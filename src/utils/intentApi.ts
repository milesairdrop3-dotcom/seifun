export type ExecutionMode = 'preview' | 'execute' | 'auto'

export type ParsedIntent = {
  intent: string
  fromToken: string | null
  toToken: string | null
  amount: string
  maxSlippagePct: number
  preferredDex: string
  executionMode: ExecutionMode
  gasPreference: string
}

export async function parseIntent(message: string): Promise<ParsedIntent> {
  const res = await fetch('/.netlify/functions/nl-intent-parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

