import { X, AlertTriangle } from 'lucide-react'
import type { SendFormValues } from '@/types'
import { TOKENS } from '@/lib/constants'
import { SubmitButton } from './SendForm'

interface ConfirmModalProps {
  values:    SendFormValues
  onConfirm: () => void
  onCancel:  () => void
  isLoading: boolean
}

export function ConfirmModal({
  values,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmModalProps) {
  const amount     = parseFloat(values.amount) || 0
  const savingsPct = values.savingsBps / 100
  const liquidPct  = 100 - savingsPct
  const savingsAmt = (amount * savingsPct / 100).toFixed(2)
  const liquidAmt  = (amount * liquidPct  / 100).toFixed(2)
  const rate       = TOKENS[values.token].usdRate
  const usdTotal   = (amount * rate).toFixed(2)

  const rows: Array<{ label: string; value: string; accent?: string }> = [
    {
      label: 'To',
      value: values.recipient.slice(0, 8) + '...' + values.recipient.slice(-4),
    },
    {
      label:  'Total amount',
      value:  `${amount.toFixed(2)} ${values.token} (≈ $${usdTotal})`,
      accent: 'text-cyan',
    },
    {
      label: 'Liquid (instant release)',
      value: `${liquidAmt} ${values.token}`,
    },
    {
      label:  'Savings (locked on-chain)',
      value:  savingsPct > 0 ? `${savingsAmt} ${values.token} · ${savingsPct}%` : 'None',
      accent: savingsPct > 0 ? 'text-gold' : undefined,
    },
    { label: 'Network fee', value: '~0.00001 XLM' },
    { label: 'Finality',    value: '3–5 seconds', accent: 'text-green-400' },
  ]

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="w-full max-w-md bg-bg-panel border border-border-strong rounded-2xl p-7 shadow-2xl animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-extrabold text-lg text-ink tracking-tight">
            Confirm Remittance
          </h2>
          <button
            onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-raised border border-border text-ink-muted hover:border-red-500/50 hover:text-red-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Summary table */}
        <div className="bg-bg-raised border border-border rounded-xl overflow-hidden mb-5">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                {row.label}
              </span>
              <span
                className={[
                  'font-mono text-[11px] font-medium text-right max-w-[200px] break-all',
                  row.accent ?? 'text-ink-muted',
                ].join(' ')}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="flex gap-3 bg-gold-dim border border-gold/20 rounded-xl px-4 py-3 mb-6">
          <AlertTriangle size={14} className="text-gold mt-0.5 shrink-0" />
          <p className="font-mono text-[11px] text-gold/80 leading-relaxed">
            This transaction will be recorded permanently on Stellar via
            Soroban smart contract. Savings will remain locked until the
            recipient withdraws.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-border rounded-lg font-display font-bold text-sm text-ink-muted uppercase tracking-wider hover:border-ink-faint hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <div className="flex-1">
            <SubmitButton loading={isLoading} onClick={onConfirm} type="button">
              Confirm
            </SubmitButton>
          </div>
        </div>
      </div>
    </div>
  )
}
