import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import type { Toast } from '@/types'
import { useToast } from '@/context/ToastContext'

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
  warning: AlertTriangle,
} as const

const STYLES = {
  success: { border: 'border-l-green-400',  icon: 'text-green-400'  },
  error:   { border: 'border-l-red-400',    icon: 'text-red-400'    },
  info:    { border: 'border-l-cyan',       icon: 'text-cyan'       },
  warning: { border: 'border-l-gold',       icon: 'text-gold'       },
} as const

export function ToastList() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  const Icon   = ICONS[toast.variant]
  const styles = STYLES[toast.variant]

  return (
    <div
      className={[
        'pointer-events-auto flex gap-3 items-start',
        'bg-bg-panel border border-border rounded-xl px-4 py-3',
        'border-l-[3px]', styles.border,
        'shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
        'animate-toast-in',
      ].join(' ')}
    >
      <Icon size={16} className={`${styles.icon} mt-0.5 shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-sm text-ink">{toast.title}</p>
        <p className="font-mono text-[11px] text-ink-muted mt-0.5 leading-relaxed break-words">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-ink-faint hover:text-ink transition-colors mt-0.5"
      >
        <X size={13} />
      </button>
    </div>
  )
}
