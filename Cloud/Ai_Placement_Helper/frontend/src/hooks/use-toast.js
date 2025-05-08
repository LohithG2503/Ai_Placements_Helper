import { useState, useCallback } from 'react'

export const useToast = () => {
  const [toasts, setToasts] = useState([])
  
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prevToasts => [...prevToasts, { id, message, type }])
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
    }, 5000)
    
    return id
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
  }, [])

  return {
    toasts,
    showToast,
    dismissToast
  }
} 