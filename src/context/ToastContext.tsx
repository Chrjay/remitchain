import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Toast, ToastVariant } from '@/types'

interface ToastContextValue {
  toasts: Toast[]
  toast: (variant: ToastVariant, title: string, message: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    (variant: ToastVariant, title: string, message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const newToast: Toast = { id, variant, title, message }
      setToasts(prev => [...prev, newToast])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 4500)
    },
    [],
  )

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
