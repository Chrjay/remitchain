import { useState, type FormEvent } from 'react'
import type { SendFormValues, TokenSymbol } from '@/types'
import { TOKENS, DEMO_SENDER, DEMO_RECIPIENT } from '@/lib/constants'

interface SendFormProps {
  onSubmit: (values: SendFormValues) => void
  isLoading: boolean
}

const TOKEN_OPTIONS: TokenSymbol[] = ['USDC', 'XLM', 'PHP']

export function SendForm({ onSubmit, isLoading }: SendFormProps) {
  const [values, setValues] = useState<SendFormValues>({
    sender:     DEMO_SENDER,
    recipient:  '',
    token:      'USDC',
    amount:     '',
    savingsBps: 0,
  })

  const set = <K extends keyof SendFormValues>(k: K, v: SendFormValues[K]) =>
    setValues(prev => ({ ...prev, [k]: v }))

  const savingsPct  = values.savingsBps / 100
  const liquidPct   = 100 - savingsPct
  const amountNum   = parseFloat(values.amount) || 0
  const liquidAmt   = (amountNum * liquidPct  / 100).toFixed(2)
  const savingsAmt  = (amountNum * savingsPct / 100).toFixed(2)
  const rate        = TOKENS[values.token].usdRate
  const usdEquiv    = (amountNum * rate).toFixed(2)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up">

      {/* Sender */}
      <Field label="Sender address" hint="Your Stellar wallet">
        <Input
          value={values.sender}
          onChange={v => set('sender', v)}
          placeholder="G... (public key)"
          monospace
        />
      </Field>

      {/* Recipient */}
      <Field label="Recipient address" hint="Family wallet in PH">
        <div className="relative">
          <Input
            value={values.recipient}
            onChange={v => set('recipient', v)}
            placeholder="G... (beneficiary public key)"
            monospace
          />
          <button
            type="button"
            onClick={() => set('recipient', DEMO_RECIPIENT)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-cyan font-mono bg-cyan-dim border border-cyan/20 px-2 py-0.5 rounded hover:bg-cyan/10 transition-colors"
          >
            Use demo
          </button>
        </div>
      </Field>

      {/* Token + Amount row */}
      <div className="grid grid-cols-3 gap-3">
        <Field label="Token">
          <select
            value={values.token}
            onChange={e => set('token', e.target.value as TokenSymbol)}
            className="w-full bg-bg-raised border border-border rounded-lg px-3 py-3 text-ink font-mono text-sm focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/10 transition-colors cursor-pointer"
          >
            {TOKEN_OPTIONS.map(t => (
              <option key={t} value={t} className="bg-bg-panel">
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Amount" hint={`≈ $${usdEquiv} USD`} className="col-span-2">
          <div className="relative">
            <Input
              value={values.amount}
              onChange={v => set('amount', v)}
              placeholder="0.00"
              type="number"
              monospace
              className="text-lg pr-20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-cyan bg-cyan-dim border border-cyan/20 px-2 py-0.5 rounded">
              {values.token}
            </span>
          </div>
        </Field>
      </div>

      {/* Savings slider */}
      <Field label="Savings lock" hint={`${values.savingsBps} bps = ${savingsPct}%`}>
        <div className="bg-bg-raised border border-border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <div className="font-code text-2xl font-bold text-gold">{savingsPct}%</div>
              <div className="font-mono text-[11px] text-ink-faint">locked on-chain</div>
            </div>
            <div className="text-right">
              <div className="font-code text-2xl font-bold text-cyan">{liquidPct}%</div>
              <div className="font-mono text-[11px] text-ink-faint">released instantly</div>
            </div>
          </div>

          <input
            type="range"
            min={0} max={50} step={5}
            value={values.savingsBps / 100}
            onChange={e => set('savingsBps', Math.round(parseFloat(e.target.value) * 100))}
            className="w-full h-1 appearance-none rounded-full bg-border outline-none cursor-pointer accent-gold"
          />

          {/* Split bar */}
          <div className="flex h-2 gap-0.5 overflow-hidden rounded">
            <div
              className="bg-cyan rounded-l transition-all duration-300"
              style={{ width: `${liquidPct}%` }}
            />
            <div
              className="bg-gold rounded-r transition-all duration-300"
              style={{ width: `${savingsPct}%` }}
            />
          </div>

          {amountNum > 0 && (
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-cyan">{liquidAmt} {values.token} liquid</span>
              <span className="text-gold">{savingsAmt} {values.token} saved</span>
            </div>
          )}
        </div>
      </Field>

      <SubmitButton loading={isLoading}>Send Remittance</SubmitButton>
    </form>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

interface FieldProps {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, hint, children, className = '' }: FieldProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint font-medium">
          {label}
        </span>
        {hint && (
          <span className="font-mono text-[10px] text-ink-faint">{hint}</span>
        )}
      </div>
      {children}
    </div>
  )
}

interface InputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  monospace?: boolean
  className?: string
  disabled?: boolean
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  monospace,
  className = '',
  disabled,
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={[
        'w-full bg-bg-raised border border-border rounded-lg px-4 py-3',
        'text-ink placeholder-ink-faint outline-none',
        'focus:border-cyan focus:ring-2 focus:ring-cyan/10',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors duration-200',
        monospace ? 'font-mono text-sm' : 'font-display text-sm',
        className,
      ].join(' ')}
    />
  )
}

interface SubmitButtonProps {
  loading: boolean
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  type?: 'submit' | 'button'
}

export function SubmitButton({
  loading,
  children,
  variant = 'primary',
  onClick,
  type = 'submit',
}: SubmitButtonProps) {
  if (variant === 'secondary') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={loading}
        className="w-full py-3 border border-cyan/30 text-cyan rounded-lg font-display font-bold text-sm uppercase tracking-wider hover:bg-cyan-dim hover:border-cyan transition-all duration-200 disabled:opacity-50"
      >
        {loading ? <Spinner /> : children}
      </button>
    )
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="w-full py-4 bg-cyan text-bg-base rounded-lg font-display font-extrabold text-sm uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 relative overflow-hidden group"
    >
      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      {loading ? <Spinner dark /> : children}
    </button>
  )
}

export function Spinner({ dark }: { dark?: boolean }) {
  return (
    <span
      className={[
        'inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin',
        dark ? 'border-bg-base/40 border-t-bg-base' : 'border-cyan/30 border-t-cyan',
      ].join(' ')}
    />
  )
}
