import { ArrowUpRight, ArrowDownLeft, Coins, TrendingDown } from 'lucide-react'
import type { TxRecord, SessionStats } from '@/types'
import { FEE_COMPARISONS, truncateAddress } from '@/lib/constants'

interface RightPanelProps {
  stats:   SessionStats
  history: TxRecord[]
}

export function RightPanel({ stats, history }: RightPanelProps) {
  return (
    <aside className="flex flex-col gap-5 p-6 border-l border-border bg-bg-raised min-h-full">

      {/* ── Session stats ── */}
      <section>
        <PanelHeader title="Portfolio" badge="Session" />
        <div className="grid grid-cols-2 gap-px bg-border rounded-xl overflow-hidden mt-3">
          <StatCell
            label="Total sent"
            value={`$${stats.totalSentUsd.toFixed(2)}`}
            color="text-cyan"
          />
          <StatCell
            label="Savings locked"
            value={`$${stats.totalSavedUsd.toFixed(2)}`}
            color="text-gold"
          />
          <StatCell
            label="Remittances"
            value={String(stats.txCount)}
            color="text-green-400"
          />
          <StatCell
            label="Avg fee"
            value={`$${stats.avgFeeUsd.toFixed(3)}`}
            color="text-ink-muted"
          />
        </div>
      </section>

      {/* ── Fee comparison ── */}
      <section>
        <PanelHeader title="Fee comparison" badge="vs traditional" />
        <div className="mt-3 bg-bg-panel border border-border rounded-xl overflow-hidden">
          {FEE_COMPARISONS.map((row, i) => (
            <div
              key={row.service}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-bg-hover transition-colors"
            >
              <span className="font-display text-xs text-ink-muted w-28 shrink-0">
                {row.service}
              </span>
              <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    i === 0 ? 'bg-green-400' : 'bg-red-400/70'
                  }`}
                  style={{ width: `${row.barWidth}%` }}
                />
              </div>
              <span
                className={`font-mono text-[11px] font-bold w-12 text-right ${
                  i === 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {row.pct.toFixed(row.pct < 0.01 ? 3 : 1)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Activity feed ── */}
      <section className="flex-1 min-h-0">
        <PanelHeader title="Activity" badge="Live" live />
        <div className="mt-3 bg-bg-panel border border-border rounded-xl overflow-hidden">
          {history.slice(0, 8).map(tx => (
            <TxRow key={tx.id} tx={tx} />
          ))}
          {history.length === 0 && (
            <div className="px-4 py-6 text-center font-mono text-[11px] text-ink-faint">
              No transactions yet
            </div>
          )}
        </div>
      </section>
    </aside>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PanelHeader({
  title,
  badge,
  live,
}: {
  title: string
  badge: string
  live?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
        {title}
      </span>
      <div className="flex items-center gap-1.5">
        {live && (
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
        )}
        <span className="font-mono text-[10px] text-ink-faint">{badge}</span>
      </div>
    </div>
  )
}

function StatCell({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-bg-panel px-4 py-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint mb-1">
        {label}
      </p>
      <p className={`font-code text-lg font-bold ${color}`}>{value}</p>
    </div>
  )
}

const TX_ICONS: Record<string, React.ReactNode> = {
  send:             <ArrowUpRight   size={13} className="text-cyan"      />,
  claim:            <ArrowDownLeft  size={13} className="text-green-400" />,
  withdraw_savings: <Coins          size={13} className="text-gold"      />,
  verify:           <TrendingDown   size={13} className="text-ink-muted" />,
}

const TX_BG: Record<string, string> = {
  send:             'bg-cyan/10',
  claim:            'bg-green-400/10',
  withdraw_savings: 'bg-gold/10',
  verify:           'bg-ink-faint/10',
}

function TxRow({ tx }: { tx: TxRecord }) {
  const isOut = tx.type === 'send'
  const timeStr = tx.timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const labelMap: Record<string, string> = {
    send:             'Send',
    claim:            'Claim',
    withdraw_savings: 'Withdraw Savings',
    verify:           'Verify',
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-bg-hover transition-colors animate-slide-in">
      {/* Icon */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${TX_BG[tx.type] ?? 'bg-ink-faint/10'}`}
      >
        {TX_ICONS[tx.type]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-xs text-ink">
          {labelMap[tx.type] ?? tx.type}
        </p>
        <p className="font-mono text-[10px] text-ink-faint truncate">
          {truncateAddress(tx.recipient ?? tx.sender)}
        </p>
      </div>

      {/* Amount + time */}
      <div className="text-right shrink-0">
        <p
          className={`font-code text-xs font-bold ${isOut ? 'text-cyan' : 'text-green-400'}`}
        >
          {isOut ? '−' : '+'}{tx.amount.toFixed(2)} {tx.token}
        </p>
        <p className="font-mono text-[10px] text-ink-faint mt-0.5">{timeStr}</p>
      </div>
    </div>
  )
}
