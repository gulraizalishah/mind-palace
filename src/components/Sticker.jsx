// An emoji shown like a sticker: white outline, soft shadow, slight tilt.
const tilt = (seed) => { let h = 0; for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) | 0; return (Math.abs(h) % 13) - 6 }

export default function Sticker({ emoji, seed = '', size = 40 }) {
  return <span className="stk" style={{ '--s': typeof size === 'number' ? `${size}px` : size, '--r': `${tilt(seed)}deg` }} aria-hidden="true">{emoji}</span>
}
