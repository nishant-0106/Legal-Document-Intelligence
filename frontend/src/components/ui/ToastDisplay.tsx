import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import type { ToastType } from '@/types'

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
  warning: AlertCircle,
}

const styles: Record<ToastType, string> = {
  success: 'bg-emerald-600  text-white',
  error:   'bg-red-600     text-white',
  info:    'bg-blue-600    text-white',
  warning: 'bg-amber-600   text-white',
}

function ToastItem({
  id,
  msg,
  type,
  onDismiss,
}: {
  id: number
  msg: string
  type: ToastType
  onDismiss: (id: number) => void
}) {
  const Icon = icons[type]
  const style = styles[type]

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  min-w-[260px] max-w-sm shadow-modal animate-slideUp ${style}`}
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{msg}</span>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastDisplay() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem id={t.id} msg={t.msg} type={t.type} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  )
}
