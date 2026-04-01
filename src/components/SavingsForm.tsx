import { useState, type FormEvent } from 'react'
import type { SavingsFormValues } from '@/types'
import { Field, Input, SubmitButton } from './SendForm'
import { PiggyBank } from 'lucide-react'

interface SavingsFormProps {
  onSubmit:  (values: SavingsFormValues) => void
  isLoading: boolean
}

export function SavingsForm({ onSubmit, isLoading }: SavingsFormProps) {
  const [values, setValues] = useState<SavingsFormValues>({
    sender:    '',
    nonce:     '',
    recipient: '',
  })

  const set = <K extends keyof SavingsFormValues>(k: K, v: SavingsFormValues[K]) =>
    setValues(prev => ({ ...prev, [k]: v }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up">
      {/* Info banner */}
      <div className="bg-gold-dim border border-gold/20 rounded-lg p-4 flex gap-3">
        <PiggyBank size={16} className="text-gold mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-display font-bold text-xs text-gold">Micro-Savings Withdrawal</p>
          <p className="font-mono text-[11px] text-gold/70 leading-relaxed">
            The savings portion locked at send time accumulates here.
            Withdraw after the remittance has been claimed.
          </p>
        </div>
      </div>

      <Field label="Original sender address" hint="OFW's G... wallet">
        <Input
          value={values.sender}
          onChange={v => set('sender', v)}
          placeholder="G... (OFW wallet)"
          monospace
        />
      </Field>

      <Field label="Remittance nonce / ID" hint="Sequence number">
        <Input
          value={values.nonce}
          onChange={v => set('nonce', v)}
          placeholder="1"
          type="number"
        />
      </Field>

      <Field label="Your address" hint="Recipient wallet">
        <Input
          value={values.recipient}
          onChange={v => set('recipient', v)}
          placeholder="G... (your wallet)"
          monospace
        />
      </Field>

      {/* Divider with label */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-[10px] text-ink-faint uppercase tracking-widest">
          withdraw_savings()
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <SubmitButton loading={isLoading}>Withdraw Savings</SubmitButton>
    </form>
  )
}
