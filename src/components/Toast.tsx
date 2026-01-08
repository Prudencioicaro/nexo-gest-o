import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    toasts: Toast[]
    addToast: (message: string, type?: ToastType, duration?: number) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

interface ToastProviderProps {
    children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
        const id = crypto.randomUUID()
        const newToast: Toast = { id, message, type, duration }

        setToasts(prev => [...prev, newToast])

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, duration)
        }
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    )
}

interface ToastContainerProps {
    toasts: Toast[]
    onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast, index) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={onRemove}
                    index={index}
                />
            ))}
        </div>
    )
}

interface ToastItemProps {
    toast: Toast
    onRemove: (id: string) => void
    index: number
}

function ToastItem({ toast, onRemove, index }: ToastItemProps) {
    const icons = {
        success: <CheckCircle size={18} className="text-green-400" />,
        error: <XCircle size={18} className="text-red-400" />,
        warning: <AlertCircle size={18} className="text-yellow-400" />,
        info: <Info size={18} className="text-blue-400" />
    }

    const bgColors = {
        success: 'bg-green-400/10 border-green-400/20',
        error: 'bg-red-400/10 border-red-400/20',
        warning: 'bg-yellow-400/10 border-yellow-400/20',
        info: 'bg-blue-400/10 border-blue-400/20'
    }

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl min-w-[280px] max-w-[400px] animate-in slide-in-from-right-5 fade-in duration-300 ${bgColors[toast.type]}`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {icons[toast.type]}
            <span className="flex-1 text-sm text-white font-medium">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    )
}

// Convenience hooks for specific toast types
export function useSuccessToast() {
    const { addToast } = useToast()
    return useCallback((message: string) => addToast(message, 'success'), [addToast])
}

export function useErrorToast() {
    const { addToast } = useToast()
    return useCallback((message: string) => addToast(message, 'error'), [addToast])
}
