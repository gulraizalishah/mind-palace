import { useEffect } from 'react'
import { attachSheetSwipe, attachTabSwipe } from '../lib/swipe'

export function useSheetSwipe() {
  useEffect(() => attachSheetSwipe(document), [])
}

export function useTabSwipe(element, onNext, onPrev) {
  useEffect(() => (element ? attachTabSwipe(element, onNext, onPrev) : undefined), [element, onNext, onPrev])
}
