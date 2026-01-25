import { toast as sonnerToast } from "sonner"

export const toast = {
  success: (message: string) => sonnerToast.success(message, { 
    duration: 3000,
    style: { background: '#10b981', color: 'white' }
  }),
  error: (message: string, error?: unknown) => {
    sonnerToast.error(message, { 
      duration: 5000,
      style: { background: '#ef4444', color: 'white' }
    })
    if (error) console.error(message, error)
  },
  info: (message: string) => sonnerToast(message, { duration: 3000 }),
  loading: (message: string) => sonnerToast.loading(message),
  promise: async <T,>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) => {
    return sonnerToast.promise(promise, messages)
  },
}
