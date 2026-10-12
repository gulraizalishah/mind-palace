import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online ? null : <div className="offline" role="status">You are offline. Saving and loading will work again when you reconnect.</div>
}
