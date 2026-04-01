import { useState, useEffect } from 'react'
import type { NetworkStats } from '@/types'
import { fetchLatestLedger } from '@/lib/contract'

const BASE_PRICE = 0.1142

export function useNetworkStats(): NetworkStats {
  const [stats, setStats] = useState<NetworkStats>({
    xlmUsd:   BASE_PRICE,
    ledger:   4_892_341,
    feeXlm:   0.00001,
    finality: '3–5s',
  })

  // Fetch real ledger on mount
  useEffect(() => {
    fetchLatestLedger().then(seq => {
      if (seq > 0) setStats(prev => ({ ...prev, ledger: seq }))
    })
  }, [])

  // Simulate live price + ledger ticks
  useEffect(() => {
    const id = setInterval(() => {
      setStats(prev => ({
        ...prev,
        xlmUsd: parseFloat(
          (BASE_PRICE + (Math.random() - 0.5) * 0.004).toFixed(4),
        ),
        ledger: prev.ledger + Math.floor(Math.random() * 3 + 1),
      }))
    }, 4_000)
    return () => clearInterval(id)
  }, [])

  return stats
}
