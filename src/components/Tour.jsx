import { useEffect, useRef, useState } from 'react'
import Sticker from './Sticker'
import { usePwaInstall } from '../hooks/usePwaInstall'

const KEY = 'mp-tour-v1'
export const tourSeen = () => { try { return localStorage.getItem(KEY) === '1' } catch { return true } }
export const markTourSeen = () => { try { localStorage.setItem(KEY, '1') } catch { /* ignore */ } }

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-label="Share" style={{ verticalAlign: '-4px' }}>
    <path d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
  </svg>
)

// A short first-visit walkthrough. It ends with how to put the app on the phone's home screen.
export default function Tour({ signedIn, onClose }) {
  const install = usePwaInstall()
  const [i, setI] = useState(0)
  const ref = useRef(null)
  const isAndroid = /android/i.test(navigator.userAgent)

  const installStep = (() => {
    if (install.installed) return { art: ['📲', '✅'], title: 'You are using the app', body: <p>Mind Palace is already on your home screen. Nice.</p> }
    if (install.canPrompt) return { art: ['📲', '🏠'], title: 'Add it to your home screen', body: (<><p>Install Mind Palace so it opens full screen like any other app, with its own icon.</p><button className="btn" onClick={install.prompt}>Install now</button></>) }
    if (install.isIos) return { art: ['📲', '🏠'], title: 'Add it to your home screen', body: (<ol className="tsteps"><li>Open this page in <b>Safari</b>.</li><li>Tap the Share button <ShareIcon /> at the bottom of the screen.</li><li>Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.</li></ol>) }
    if (isAndroid) return { art: ['📲', '🏠'], title: 'Add it to your home screen', body: (<ol className="tsteps"><li>Open this page in <b>Chrome</b>.</li><li>Tap the <b>⋮</b> menu at the top right.</li><li>Tap <b>Install app</b> (or <b>Add to Home screen</b>), then confirm.</li></ol>) }
    return { art: ['💻', '🏠'], title: 'Install it on your computer', body: <p>In Chrome or Edge, click the install icon at the right end of the address bar. On a phone, open this page in Safari (iPhone) or Chrome (Android) to add it to the home screen.</p> }
  })()

  const steps = [
    { art: ['🏛️', '💡', '🧠'], title: 'Welcome to Mind Palace', body: <p>Learn useful things in seconds, then keep them in a palace you can walk through. This quick tour takes about a minute.</p> },
    { art: ['📖', '👆'], title: 'Read in seconds', body: <p>Each card shows a short preview. <b>Tap a card</b> to read the full explanation and its source. The topic bar under the app name filters what you see.</p> },
    { art: ['💾', '🧊', '🖼️'], title: 'Save it to your palace', body: <p>Tap <b>Save to Palace</b>, choose a room, then where in it: the fridge, a shelf, a wall picture or a small storage box. {signedIn ? '' : 'You will be asked to log in the first time you save.'}</p> },
    { art: ['🚪', '🏠', '🪜'], title: 'Walk through your palace', body: <p>Open the <b>Palace</b> tab and tap the front door. Tap doors to enter rooms, and stairs to go up or down. <b>Drag to look around.</b> Tap furniture to see everything kept inside it.</p> },
    { art: ['✏️', '🖼️', '📦'], title: 'Add your own memories', body: <p>Tap the <b>＋</b> button in the Palace to remember anything from your own mind. Each wall holds six hanging pictures. When a wall is full, make a storage box.</p> },
    { art: ['🧠', '🔥', '🎯'], title: 'Review to remember', body: <p>The <b>Review</b> tab asks you short questions about what you saved, a little later each time. The flame at the top counts the days in a row you learned something.</p> },
    { art: ['👈', '👉', '👇'], title: 'Swipe around', body: <p><b>Swipe left or right</b> to move between Home, Palace, Review and Profile. <b>Pull a card or pop-up down</b> to close it. In the palace, swiping looks around instead.</p> },
    installStep,
    { art: ['🎉', '🏛️'], title: 'You are ready', body: <p>You can replay this tour any time from the <b>Profile</b> tab. Happy learning!</p> },
  ]
  const s = steps[i], last = i === steps.length - 1

  const done = () => { markTourSeen(); onClose() }
  useEffect(() => { ref.current?.focus() }, [i])
  useEffect(() => {
    const key = (e) => { if (e.key === 'ArrowRight') setI((n) => Math.min(n + 1, steps.length - 1)); if (e.key === 'ArrowLeft') setI((n) => Math.max(n - 1, 0)) }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [steps.length])

  return (
    <div className="tourwrap" role="presentation">
      <div className="card tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
        <button className="tskip" onClick={done}>Skip</button>
        <div className="tart" aria-hidden="true">{s.art.map((e, k) => <Sticker key={k} emoji={e} size={k === 0 ? 46 : 32} seed={`${i}${k}`} />)}</div>
        <h2 id="tour-title" ref={ref} tabIndex={-1}>{s.title}</h2>
        <div className="tbody" aria-live="polite">{s.body}</div>
        <div className="tdots" aria-hidden="true">{steps.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
        <div className="tnav">
          <button className="ghost" style={{ marginTop: 0 }} disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
          <button className="btn" onClick={() => (last ? done() : setI(i + 1))}>{last ? 'Start exploring' : 'Next'}</button>
        </div>
        <p className="tcount">{i + 1} of {steps.length}</p>
      </div>
    </div>
  )
}
