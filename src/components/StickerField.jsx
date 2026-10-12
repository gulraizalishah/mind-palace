import { useState } from 'react'

const QUICK = ['💡', '⭐', '❗', '🎯', '🔑', '🧠', '❤️', '📌']
const GROUPS = {
  Memory: ['💡', '⭐', '❗', '🎯', '🔑', '🧠', '❤️', '📌', '🔔', '⏰', '✅', '🚀', '🏆', '👀', '💬', '📝'],
  Food: ['🍳', '🥩', '🍎', '🥦', '🍞', '🧀', '☕', '🍕', '🥗', '🍜', '🧂', '🔪', '🥄', '🍰', '🌶️', '🥚'],
  Home: ['🏠', '🔧', '🔨', '🪛', '🧯', '🚰', '🛁', '🛋️', '🧹', '🧴', '💡', '🔌', '🪟', '🚪', '🧰', '🪜'],
  Cars: ['🚗', '🛞', '🔋', '⛽', '🚦', '🛠️', '🅿️', '🚨', '🧭', '🚲', '🏍️', '🚌', '🛣️', '⚙️', '🔩', '🧊'],
  Money: ['💰', '💳', '🏦', '📈', '📉', '🪙', '🧾', '💵', '🏷️', '🧮', '🐷', '📊', '🤝', '🔒', '💎', '🛒'],
  Nature: ['🌳', '🌻', '🌱', '🐝', '🦋', '🐶', '🐱', '🌧️', '☀️', '🌙', '⭐', '🔥', '💧', '🌍', '🍃', '🐢'],
  Faces: ['😀', '😅', '🤔', '😬', '😎', '🥳', '😴', '🤯', '😮', '🙃', '😍', '🤓', '😇', '🫡', '🙌', '👍'],
  Things: ['📚', '🖥️', '📱', '🎧', '🎨', '🎵', '✈️', '🧳', '🗺️', '🎁', '🔬', '🧪', '🩺', '💊', '🧠', '🏋️'],
}

export default function StickerField({ value, onChange }) {
  const [more, setMore] = useState(false)
  const [group, setGroup] = useState('Memory')
  const [typed, setTyped] = useState('')
  const quick = [...new Set([value, ...QUICK].filter(Boolean))].slice(0, 8)

  function onType(v) {
    setTyped(v)
    const first = [...new Intl.Segmenter().segment(v)][0]?.segment
    if (first && /\p{Extended_Pictographic}/u.test(first)) onChange(first)
  }

  return (
    <div className="stkfield">
      <div className="quick" role="group" aria-label="Sticker">
        {quick.map((e) => <button key={e} type="button" className="eb" aria-pressed={value === e} aria-label={`Sticker ${e}`} onClick={() => onChange(e)}>{e}</button>)}
        <button type="button" className="eb more" aria-expanded={more} aria-label="More stickers" onClick={() => setMore(!more)}>{more ? '–' : '＋'}</button>
      </div>
      {more && (
        <div className="picker">
          <div className="gtabs">
            {Object.keys(GROUPS).map((g) => <button key={g} type="button" className="gtab" aria-pressed={g === group} onClick={() => setGroup(g)}>{g}</button>)}
          </div>
          <div className="egrid">
            {GROUPS[group].map((e) => <button key={e} type="button" className="eb" aria-pressed={value === e} aria-label={`Sticker ${e}`} onClick={() => onChange(e)}>{e}</button>)}
          </div>
          <label className="etype">Or paste any emoji
            <input value={typed} onChange={(e) => onType(e.target.value)} placeholder="🙂" maxLength={12} />
          </label>
        </div>
      )}
    </div>
  )
}
