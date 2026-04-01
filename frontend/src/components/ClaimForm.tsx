import { useState, type FormEvent } from 'react'
import type { ClaimFormValues } from '@/types'
import { Field, Input, SubmitButton } from './SendForm'

interface ClaimFormProps {
  onSubmit: (values: ClaimFormValues) => void
  isLoading: boolean
}

export function ClaimForm({ onSubmit, isLoading }: ClaimFormProps) {
  const [values, setValues] = useState<ClaimFormValues>({
    sender:    '',
    nonce:     '',
    recipient: '',
  })

  const set = <K extends keyof ClaimFormValues>(k: K, v: ClaimFormValues[K]) =>
    setValues(prev => ({ ...prev, [k]: v }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up">
      <div className="bg-bg-raised border border-cyan/20 rounded-lg px-4 py-3 font-mono text-[11px] text-cyan/80 leading-relaxed">
        ◈ Enter the original sender's address and the remittance nonce to release
        your funds. The liquid portion transfers to your wallet immediately.
      </div>

      <Field label="Original sender address" hint="OFW's G... wallet">
        <Input
          value={values.sender}
          onChange={v => set('sender', v)}
          placeholder="G... (OFW wallet)"
          monospace
        />
      </Field>

      <Field label="Remittance nonce / ID" hint="Returned when remittance was sent">
        <Input
          value={values.nonce}
          onChange={v => set('nonce', v)}
          placeholder="1"
          type="number"
          monospace
        />
      </Field>

      <Field label="Your address (recipient)" hint="Your G... wallet">
        <Input
          value={values.recipient}
          onChange={v => set('recipient', v)}
          placeholder="G... (your wallet)"
          monospace
        />
      </Field>

      <SubmitButton loading={isLoading}>Claim Remittance</SubmitButton>
    </form>
  )
}
