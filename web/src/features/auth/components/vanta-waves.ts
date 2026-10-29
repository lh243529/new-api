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
import type { VantaWavesOptions } from 'vanta/src/vanta.waves.js'

// Keep Three.js and WAVES in asynchronous chunks, outside the public page bundle.
export async function loadVantaWaves() {
  const [THREE, { default: waves }] = await Promise.all([
    import('three'),
    import('vanta/src/vanta.waves.js'),
  ])

  return (element: HTMLElement): (() => void) => {
    const options: VantaWavesOptions = {
      el: element,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1,
      scaleMobile: 1,
      color: 0x005588,
      shininess: 30,
      waveHeight: 20,
      waveSpeed: 1,
      zoom: 1,
    }
    const effect = waves(options)
    const renderer = effect.renderer
    let disposed = false

    function dispose(): void {
      if (disposed) return
      disposed = true
      try {
        effect.destroy()
      } finally {
        // Vanta destroys geometry and listeners, but leaves renderer disposal to us.
        renderer?.dispose()
        renderer?.forceContextLoss()
        renderer?.domElement.remove()
      }
    }

    if (!renderer || !element.contains(renderer.domElement)) {
      dispose()
      throw new Error('WAVES renderer could not initialize')
    }
    return dispose
  }
}
