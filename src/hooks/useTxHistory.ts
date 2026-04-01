import { useState, useCallback } from 'react'
import type { TxRecord, TxType, TokenSymbol, StellarAddress } from '@/types'

export function useTxHistory() {
  const [history, setHistory] = useState<TxRecord[]>([
    {
      id:        'demo-1',
      type:      'send',
      sender:    'GOFW3KLDM9XPQR74UVBHQJT2NE5A6CDWYZMSB2D4K',
      recipient: 'GFAM9PQRUVBHQJT2NE5A6CDWYZMSB2D4KGOFW3KLD',
      amount:    100,
      token:     'USDC',
      nonce:     1,
      savingsBps:1000,
      status:    'confirmed',
      timestamp: new Date(Date.now() - 60_000 * 5),
    },
    {
      id:        'demo-2',
      type:      'claim',
      sender:    'GFAM9PQRUVBHQJT2NE5A6CDWYZMSB2D4KGOFW3KLD',
      amount:    90,
      token:     'USDC',
      nonce:     1,
      status:    'confirmed',
      timestamp: new Date(Date.now() - 60_000 * 2),
    },
  ])

  const addTx = useCallback(
    (
      type: TxType,
      sender: StellarAddress,
      amount: number,
      token: TokenSymbol,
      extras?: Partial<TxRecord>,
    ) => {
      const record: TxRecord = {
        id:        `tx-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        sender,
        amount,
        token,
        status:    'confirmed',
        timestamp: new Date(),
        ...extras,
      }
      setHistory(prev => [record, ...prev])
      return record
    },
    [],
  )

  return { history, addTx }
}
