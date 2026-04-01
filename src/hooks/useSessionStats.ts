import { useMemo } from 'react'
import type { TxRecord, SessionStats } from '@/types'
import { TOKENS } from '@/lib/constants'

export function useSessionStats(history: TxRecord[]): SessionStats {
  return useMemo(() => {
    let totalSentUsd  = 0
    let totalSavedUsd = 0
    let txCount = 0

    for (const tx of history) {
      if (tx.id.startsWith('demo-')) continue
      const rate = TOKENS[tx.token]?.usdRate ?? 1
      if (tx.type === 'send') {
        txCount++
        totalSentUsd += tx.amount * rate
        if (tx.savingsBps) {
          totalSavedUsd += tx.amount * rate * (tx.savingsBps / 10_000)
        }
      }
    }

    return {
      totalSentUsd,
      totalSavedUsd,
      txCount,
      avgFeeUsd: 0.001,
    }
  }, [history])
}
