// ─── Stellar / Contract types ─────────────────────────────────────────────────

export type StellarAddress = string   // G... public key
export type ContractId    = string   // C... Soroban contract ID
export type TxHash        = string

export type TokenSymbol = 'USDC' | 'XLM' | 'PHP'

export interface TokenMeta {
  symbol: TokenSymbol
  name: string
  decimals: number
  usdRate: number   // mock USD conversion rate
  contractId: string
}

// ─── Remittance record (mirrors Soroban contract struct) ──────────────────────

export interface RemittanceRecord {
  sender:      StellarAddress
  recipient:   StellarAddress
  amount:      bigint         // in stroops (1 XLM = 10_000_000)
  claimed:     boolean
  savingsBps:  number         // 0–10000
  token:       ContractId
}

// ─── App-level transaction types ─────────────────────────────────────────────

export type TxType = 'send' | 'claim' | 'withdraw_savings' | 'verify'

export interface TxRecord {
  id:         string
  type:       TxType
  sender:     StellarAddress
  recipient?: StellarAddress
  amount:     number
  token:      TokenSymbol
  nonce?:     number
  savingsBps?: number
  hash?:      TxHash
  status:     'pending' | 'confirmed' | 'failed'
  timestamp:  Date
}

// ─── Form state types ─────────────────────────────────────────────────────────

export interface SendFormValues {
  sender:     StellarAddress
  recipient:  StellarAddress
  token:      TokenSymbol
  amount:     string
  savingsBps: number
}

export interface ClaimFormValues {
  sender:    StellarAddress
  nonce:     string
  recipient: StellarAddress
}

export interface VerifyFormValues {
  sender: StellarAddress
  nonce:  string
}

export interface SavingsFormValues {
  sender:    StellarAddress
  nonce:     string
  recipient: StellarAddress
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id:      string
  variant: ToastVariant
  title:   string
  message: string
}

// ─── Contract invocation result ───────────────────────────────────────────────

export interface InvokeResult<T = void> {
  success: boolean
  data?:   T
  hash?:   TxHash
  error?:  string
}

// ─── Network stats (live ticker) ─────────────────────────────────────────────

export interface NetworkStats {
  xlmUsd:    number
  ledger:    number
  feeXlm:    number
  finality:  string
}

// ─── Session stats ────────────────────────────────────────────────────────────

export interface SessionStats {
  totalSentUsd:  number
  totalSavedUsd: number
  txCount:       number
  avgFeeUsd:     number
}
