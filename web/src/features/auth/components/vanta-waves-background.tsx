/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useRef } from 'react'

import { loadVantaWaves } from './vanta-waves'

export function VantaWavesBackground() {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let generation = 0
    let cleanup: (() => void) | undefined
    let disposed = false

    function stop(): void {
      generation += 1
      cleanup?.()
      cleanup = undefined
    }

    async function sync(): Promise<void> {
      stop()
      if (!element || disposed || document.hidden || motion.matches) return
      const currentGeneration = generation
      try {
        const create = await loadVantaWaves()
        if (disposed || currentGeneration !== generation) return
        cleanup = create(element)
      } catch {
        // The blue CSS background remains usable when WebGL or loading fails.
        if (!disposed && currentGeneration === generation) {
          element.replaceChildren()
        }
      }
    }

    function onChange(): void {
      void sync()
    }

    document.addEventListener('visibilitychange', onChange)
    motion.addEventListener('change', onChange)
    void sync()

    return () => {
      disposed = true
      stop()
      document.removeEventListener('visibilitychange', onChange)
      motion.removeEventListener('change', onChange)
    }
  }, [])

  return (
    <div
      ref={elementRef}
      aria-hidden='true'
      data-slot='auth-waves-background'
      className='pointer-events-none fixed inset-0 -z-10 bg-[#005588]'
    />
  )
}
