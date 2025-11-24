import { useState, useEffect } from 'react'

/**
 * Custom hook to detect media query matches
 * @param query - CSS media query string
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    // Create listener
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    // Add listener
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        // Fallback for older browsers
        media.removeListener(listener)
      }
    }
  }, [matches, query])

  return matches
}

/**
 * Hook to detect if the device is mobile (screen width < 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/**
 * Hook to detect if the device is tablet (screen width between 768px and 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

/**
 * Hook to detect if the device is desktop (screen width >= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

/**
 * Hook to detect if the device supports touch
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - for older browsers
      navigator.msMaxTouchPoints > 0
    )
  }, [])

  return isTouch
}
