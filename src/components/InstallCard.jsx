import { usePwaInstall } from '../hooks/usePwaInstall'

export default function InstallCard() {
  const { installed, isIos, canPrompt, prompt } = usePwaInstall()
  if (installed) return null
  if (!canPrompt && !isIos) return null
  return (
    <section className="note install">
      <h3>Install Mind Palace</h3>
      {canPrompt && (<><p>Add it to your home screen for a full-screen app.</p><button className="btn" onClick={prompt}>Install app</button></>)}
      {isIos && !canPrompt && <p>In Safari, tap the <b>Share</b> button, then <b>Add to Home Screen</b>.</p>}
    </section>
  )
}
