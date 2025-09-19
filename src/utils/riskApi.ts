export type RiskResult = {
  address: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  securityScore: number
  warnings: string[]
}

export async function fetchRisk(tokenAddress: string): Promise<RiskResult> {
  const res = await fetch('/.netlify/functions/seifun-risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenAddress })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

