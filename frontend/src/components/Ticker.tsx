import type { NetworkStats } from '@/types'

interface TickerProps {
  stats: NetworkStats
}

export function Ticker({ stats }: TickerProps) {
  const items = [
    { label: 'XLM/USD', value: `$${stats.xlmUsd.toFixed(4)}`, accent: true },
    { label: 'Network',  value: 'Testnet' },
    { label: 'Ledger',   value: stats.ledger.toLocaleString() },
    { label: 'Avg Fee',  value: `${stats.feeXlm} XLM` },
    { label: 'Finality', value: stats.finality, accent: true },
  ]

  return (
    <div className="bg-bg-raised border-b border-border px-6 py-2 overflow-x-auto">
      <div className="flex items-center gap-6 min-w-max max-w-screen-xl mx-auto">
        {items.map((item, i) => (
          <div key={item.label} className="flex items-center gap-5">
            {i > 0 && (
              <span className="text-border-strong select-none">│</span>
            )}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                {item.label}
              </span>
              <span
                className={[
                  'font-mono text-[11px] font-medium',
                  item.accent ? 'text-cyan' : 'text-ink-muted',
                ].join(' ')}
              >
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
