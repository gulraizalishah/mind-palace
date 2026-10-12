import { useEffect, useState } from 'react'

// Android/Chrome can show an install prompt. iPhone cannot: it needs "Add to Home Screen" from Safari.
export function usePwaInstall() {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)

  useEffect(() => {
    const before = (e) => { e.preventDefault(); setDeferred(e) }
    const done = () => { setInstalled(true); setDeferred(null) }
    window.addEventListener('beforeinstallprompt', before)
    window.addEventListener('appinstalled', done)
    return () => { window.removeEventListener('beforeinstallprompt', before); window.removeEventListener('appinstalled', done) }
  }, [])

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
  return {
    installed, isIos, canPrompt: !!deferred,
    prompt: async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; setDeferred(null) },
  }
}
