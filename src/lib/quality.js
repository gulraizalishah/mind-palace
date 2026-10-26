// How good the 3D palace should look. "auto" picks by how strong the phone seems to be.
const KEY = 'mp-3d-quality'
export const getQualityChoice = () => { try { return localStorage.getItem(KEY) || 'auto' } catch { return 'auto' } }
export const setQualityChoice = (v) => { try { localStorage.setItem(KEY, v) } catch { /* ignore */ } }
export function resolveQuality() {
  const c = getQualityChoice()
  const weak = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 2
  const best = c === 'best' || (c === 'auto' && !weak)
  return { best, shadows: best, pixelRatio: best ? 2 : 1.25 }
}
