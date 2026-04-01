import { useState } from 'react'
import { Navbar }       from '@/components/Navbar'
import { Ticker }       from '@/components/Ticker'
import { SendForm }     from '@/components/SendForm'
import { ClaimForm }    from '@/components/ClaimForm'
import { VerifyForm }   from '@/components/VerifyForm'
import { SavingsForm }  from '@/components/SavingsForm'
import { RightPanel }   from '@/components/RightPanel'
import { ConfirmModal } from '@/components/ConfirmModal'
import { ToastList }    from '@/components/ToastList'
import { useToast }     from '@/context/ToastContext'
import { useNetworkStats }  from '@/hooks/useNetworkStats'
import { useTxHistory }     from '@/hooks/useTxHistory'
import { useSessionStats }  from '@/hooks/useSessionStats'
import {
  sendRemittance,
  claimRemittance,
  withdrawSavings,
  isClaimed,
  getRemittance,
} from '@/lib/contract'
import { truncateAddress } from '@/lib/constants'
import type {
  SendFormValues,
  ClaimFormValues,
  VerifyFormValues,
  SavingsFormValues,
  RemittanceRecord,
} from '@/types'

type Tab = 'send' | 'claim' | 'verify' | 'savings'

export default function App() {
  const { toast }          = useToast()
  const networkStats       = useNetworkStats()
  const { history, addTx } = useTxHistory()
  const sessionStats       = useSessionStats(history)

  const [activeTab, setActiveTab] = useState<Tab>('send')

  // ── Loading states ─────────────────────────────────────────────
  const [loadingSend,   setLoadingSend]   = useState(false)
  const [loadingClaim,  setLoadingClaim]  = useState(false)
  const [loadingVerify, setLoadingVerify] = useState(false)
  const [loadingRecord, setLoadingRecord] = useState(false)
  const [loadingSavings,setLoadingSavings]= useState(false)

  // ── Confirm modal ──────────────────────────────────────────────
  const [pendingSend, setPendingSend] = useState<SendFormValues | null>(null)

  // ─────────────────────────────────────────────────────────────
  // SEND — opens confirm modal first
  // ─────────────────────────────────────────────────────────────
  function handleSendFormSubmit(values: SendFormValues) {
    if (!values.recipient.trim()) {
      toast('error', 'Missing field', 'Please enter a recipient address.')
      return
    }
    if (!parseFloat(values.amount) || parseFloat(values.amount) <= 0) {
      toast('error', 'Missing field', 'Please enter a valid amount.')
      return
    }
    setPendingSend(values)
  }

  async function handleSendConfirm() {
    if (!pendingSend) return
    setLoadingSend(true)
    try {
      const result = await sendRemittance({
        sender:     pendingSend.sender,
        recipient:  pendingSend.recipient,
        token:      pendingSend.token,
        amount:     parseFloat(pendingSend.amount),
        savingsBps: pendingSend.savingsBps,
      })

      if (result.success && result.data) {
        const { nonce } = result.data
        toast(
          'success',
          'Remittance sent!',
          `Nonce #${nonce} · ${truncateAddress(pendingSend.recipient)}`,
        )
        addTx('send', pendingSend.sender, parseFloat(pendingSend.amount), pendingSend.token, {
          recipient:   pendingSend.recipient,
          nonce,
          savingsBps:  pendingSend.savingsBps,
          hash:        result.hash,
        })
        setPendingSend(null)
      } else {
        toast('error', 'Transaction failed', result.error ?? 'Unknown error')
      }
    } finally {
      setLoadingSend(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CLAIM
  // ─────────────────────────────────────────────────────────────
  async function handleClaim(values: ClaimFormValues) {
    if (!values.sender || !values.nonce || !values.recipient) {
      toast('error', 'Missing fields', 'Fill in all three fields.')
      return
    }
    setLoadingClaim(true)
    toast('info', 'Processing…', 'Calling claim_remittance() on Soroban…')
    try {
      const result = await claimRemittance({
        sender:    values.sender,
        nonce:     parseInt(values.nonce),
        recipient: values.recipient,
      })
      if (result.success) {
        toast('success', 'Claimed!', 'Liquid funds released to your wallet.')
        addTx('claim', values.recipient, 0, 'USDC', {
          nonce: parseInt(values.nonce),
          hash:  result.hash,
        })
      } else {
        toast('error', 'Claim failed', result.error ?? 'Unknown error')
      }
    } finally {
      setLoadingClaim(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // VERIFY
  // ─────────────────────────────────────────────────────────────
  async function handleVerify(values: VerifyFormValues): Promise<boolean | null> {
    if (!values.sender || !values.nonce) {
      toast('error', 'Missing fields', 'Enter sender address and nonce.')
      return null
    }
    setLoadingVerify(true)
    try {
      const result = await isClaimed(values.sender, parseInt(values.nonce))
      if (result.success) {
        toast(
          result.data ? 'success' : 'warning',
          result.data ? 'Claimed ✓' : 'Unclaimed',
          result.data
            ? 'This remittance has been claimed.'
            : 'Remittance is pending — not yet claimed.',
        )
        return result.data ?? false
      } else {
        toast('error', 'Verify failed', result.error ?? 'Unknown error')
        return null
      }
    } finally {
      setLoadingVerify(false)
    }
  }

  async function handleGetRecord(values: VerifyFormValues): Promise<RemittanceRecord | null> {
    if (!values.sender || !values.nonce) {
      toast('error', 'Missing fields', 'Enter sender address and nonce.')
      return null
    }
    setLoadingRecord(true)
    try {
      const result = await getRemittance(values.sender, parseInt(values.nonce))
      if (result.success && result.data) {
        return result.data
      } else {
        toast('error', 'Not found', result.error ?? 'Record not found on-chain')
        return null
      }
    } finally {
      setLoadingRecord(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // WITHDRAW SAVINGS
  // ─────────────────────────────────────────────────────────────
  async function handleWithdrawSavings(values: SavingsFormValues) {
    if (!values.sender || !values.nonce || !values.recipient) {
      toast('error', 'Missing fields', 'Fill in all three fields.')
      return
    }
    setLoadingSavings(true)
    toast('info', 'Processing…', 'Calling withdraw_savings() on Soroban…')
    try {
      const result = await withdrawSavings({
        sender:    values.sender,
        nonce:     parseInt(values.nonce),
        recipient: values.recipient,
      })
      if (result.success) {
        toast('success', 'Savings withdrawn!', 'Savings released to your wallet.')
        addTx('withdraw_savings', values.recipient, 0, 'USDC', {
          nonce: parseInt(values.nonce),
          hash:  result.hash,
        })
      } else {
        toast('error', 'Withdrawal failed', result.error ?? 'Unknown error')
      }
    } finally {
      setLoadingSavings(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-base text-ink font-display">
      {/* Grid texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,229,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Top-right glow */}
      <div
        className="fixed top-[-200px] right-[-200px] w-[600px] h-[600px] pointer-events-none z-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        <Ticker stats={networkStats} />

        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] min-h-[calc(100vh-110px)]">

          {/* ── Left: forms ── */}
          <main className="px-6 py-8 border-r border-border">
            {/* Page heading */}
            <div className="mb-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan flex items-center gap-2 mb-2">
                <span className="inline-block w-5 h-px bg-cyan" />
                Stellar Soroban · SEA Corridor
              </p>
              <h1 className="font-display font-extrabold text-4xl tracking-tight leading-none text-ink">
                OFW{' '}
                <span className="text-cyan">Remittance</span>
                <br />
                Desk
              </h1>
            </div>

            {/* Tab strip */}
            <div className="flex border-b border-border mb-8 -mx-1">
              {(['send','claim','verify','savings'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={[
                    'px-5 py-3 text-[11px] font-bold uppercase tracking-widest font-display',
                    'border-b-2 -mb-px transition-all duration-200',
                    activeTab === tab
                      ? 'text-cyan border-cyan'
                      : 'text-ink-faint border-transparent hover:text-ink-muted',
                  ].join(' ')}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Form panels */}
            {activeTab === 'send' && (
              <SendForm
                onSubmit={handleSendFormSubmit}
                isLoading={loadingSend}
              />
            )}
            {activeTab === 'claim' && (
              <ClaimForm
                onSubmit={handleClaim}
                isLoading={loadingClaim}
              />
            )}
            {activeTab === 'verify' && (
              <VerifyForm
                onVerify={handleVerify}
                onGetRecord={handleGetRecord}
                isLoadingVerify={loadingVerify}
                isLoadingRecord={loadingRecord}
              />
            )}
            {activeTab === 'savings' && (
              <SavingsForm
                onSubmit={handleWithdrawSavings}
                isLoading={loadingSavings}
              />
            )}
          </main>

          {/* ── Right: stats panel ── */}
          <RightPanel stats={sessionStats} history={history} />
        </div>
      </div>

      {/* Confirm modal */}
      {pendingSend && (
        <ConfirmModal
          values={pendingSend}
          onConfirm={handleSendConfirm}
          onCancel={() => setPendingSend(null)}
          isLoading={loadingSend}
        />
      )}

      {/* Toasts */}
      <ToastList />
    </div>
  )
}
