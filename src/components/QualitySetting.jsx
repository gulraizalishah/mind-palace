import { useState } from 'react'
import { getQualityChoice, setQualityChoice } from '../lib/quality'

// How detailed the 3D palace looks. "Faster" saves battery on older phones.
export default function QualitySetting() {
  const [v, setV] = useState(getQualityChoice)
  const pick = (id) => { setQualityChoice(id); setV(id) }
  return (
    <div>
      <div className="seg" role="group" aria-label="3D palace quality">
        {[['auto', 'Auto'], ['best', 'Best looking'], ['fast', 'Faster']].map(([id, label]) => (
          <button key={id} aria-pressed={v === id} onClick={() => pick(id)}>{label}</button>
        ))}
      </div>
      <p className="src">Best looking adds soft shadows. It applies the next time you open the Palace.</p>
    </div>
  )
}
