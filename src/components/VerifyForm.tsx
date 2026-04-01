import { useState, type FormEvent } from 'react'
import type { VerifyFormValues, RemittanceRecord } from '@/types'
import { Field, Input, SubmitButton } from './SendForm'
import { truncateAddress, fromStroops, TOKENS } from '@/lib/constants'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

interface VerifyFormProps {
  onVerify:       (values: VerifyFormValues) => Promise<boolean | null>
  onGetRecord:    (values: VerifyFormValues) => Promise<RemittanceRecord | null>
  isLoadingVerify: boolean
  isLoadingRecord: boolean
}

type VerifyState =
  | { kind: 'idle' }
  | { kind: 'claimed' }
  | { kind: 'pending' }
  | { kind: 'record'; data: RemittanceRecord }

export function VerifyForm({
  onVerify,
  onGetRecord,
  isLoadingVerify,
  isLoadingRecord,
}: VerifyFormProps) {
  const [values, setValues] = useState<VerifyFormValues>({
    sender: '',
    nonce:  '',
  })
  const [result, setResult] = useState<VerifyState>({ kind: 'idle' })

  const set = <K extends keyof VerifyFormValues>(k: K, v: VerifyFormValues[K]) =>
    setValues(prev => ({ ...prev, [k]: v }))

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    setResult({ kind: 'idle' })
    const claimed = await onVerify(values)
    if (claimed === null) return
    setResult(claimed ? { kind: 'claimed' } : { kind: 'pending' })
  }

  async function handleGetRecord() {
    const record = await onGetRecord(values)
    if (record) setResult({ kind: 'record', data: record })
  }

  // Find token symbol from contractId
  function tokenSymbol(contractId: string) {
    const entry = Object.values(TOKENS).find(t => t.contractId === contractId)
    return entry?.symbol ?? 'USDC'
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <form onSubmit={handleVerify} className="space-y-5">
        <Field label="Sender address" hint="OFW's G... wallet">
          <Input
            value={values.sender}
            onChange={v => set('sender', v)}
            placeholder="G... (OFW wallet)"
            monospace
          />
        </Field>

        <Field label="Nonce / ID" hint="Remittance sequence number">
          <Input
            value={values.nonce}
            onChange={v => set('nonce', v)}
            placeholder="1"
            type="number"
            monospace
          />
        </Field>

        <SubmitButton loading={isLoadingVerify}>
          Verify On-Chain
        </SubmitButton>
      </form>

      <SubmitButton
        loading={isLoadingRecord}
        variant="secondary"
        type="button"
        onClick={handleGetRecord}
      >
        Get Full Record
      </SubmitButton>

      {/* Result card */}
      {result.kind !== 'idle' && (
        <div
          className={[
            'rounded-lg border p-4 space-y-3 animate-fade-up',
            result.kind === 'claimed'
              ? 'bg-green-950/30 border-green-500/30'
              : result.kind === 'pending'
              ? 'bg-red-950/30 border-red-500/30'
              : 'bg-bg-raised border-border',
          ].join(' ')}
        >
          {/* Status row */}
          {(result.kind === 'claimed' || result.kind === 'pending') && (
            <div className="flex items-center gap-2">
              {result.kind === 'claimed' ? (
                <CheckCircle size={16} className="text-green-400" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
              <span
                className={[
                  'font-display font-bold text-sm',
                  result.kind === 'claimed' ? 'text-green-400' : 'text-red-400',
                ].join(' ')}
              >
                {result.kind === 'claimed' ? 'Claimed ✓' : 'Unclaimed — pending'}
              </span>
            </div>
          )}

          {/* Record details */}
          {result.kind === 'record' && (
            <>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mb-2">
                On-chain record
              </div>
              <RecordRow label="Sender"    value={truncateAddress(result.data.sender)} />
              <RecordRow label="Recipient" value={truncateAddress(result.data.recipient)} />
              <RecordRow
                label="Amount"
                value={`${fromStroops(result.data.amount).toFixed(2)} ${tokenSymbol(result.data.token)}`}
              />
              <RecordRow
                label="Savings"
                value={`${result.data.savingsBps / 100}% (${result.data.savingsBps} bps)`}
                accent="gold"
              />
              <RecordRow
                label="Status"
                value={result.data.claimed ? 'CLAIMED' : 'PENDING'}
                accent={result.data.claimed ? 'green' : 'red'}
              />
            </>
          )}

          {/* Common footer */}
          <div className="pt-1 border-t border-border-subtle">
            <span className="font-mono text-[10px] text-ink-faint">
              Checked · {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function RecordRow({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'gold' | 'green' | 'red'
}) {
  const colorMap = {
    gold:  'text-gold',
    green: 'text-green-400',
    red:   'text-red-400',
  }
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10px] text-ink-faint uppercase tracking-wider">
        {label}
      </span>
      <span
        className={[
          'font-mono text-[11px]',
          accent ? colorMap[accent] : 'text-ink-muted',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  )
}
