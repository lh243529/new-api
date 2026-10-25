import { afterEach, describe, expect, it, vi } from 'vitest'

import { startHeroParticleEngine } from '../hero-particle-engine'

function createCanvasContext(): CanvasRenderingContext2D {
  const gradient = { addColorStop: vi.fn() } as unknown as CanvasGradient
  const data = new Uint8ClampedArray(640 * 480 * 4)
  for (let y = 147; y <= 152; y++) {
    for (let x = 318; x <= 323; x++) {
      data[(y * 640 + x) * 4 + 3] = 255
    }
  }
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    createRadialGradient: vi.fn(() => gradient),
    createLinearGradient: vi.fn(() => gradient),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    getImageData: vi.fn(() => ({ data }) as ImageData),
  } as unknown as CanvasRenderingContext2D
}

describe('hero particle engine', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('draws a static particle title when reduced motion is requested', () => {
    const context = createCanvasContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame')
    const stage = document.createElement('div')
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 640,
      bottom: 480,
      width: 640,
      height: 480,
    } as DOMRect)
    const backgroundCanvas = document.createElement('canvas')
    const textCanvas = document.createElement('canvas')

    const cleanup = startHeroParticleEngine(
      stage,
      backgroundCanvas,
      textCanvas,
      { x: -10000, y: -10000, active: false },
      true
    )

    expect(backgroundCanvas.width).toBe(640)
    expect(backgroundCanvas.height).toBe(480)
    expect(context.fillRect).toHaveBeenCalled()
    expect(context.fillText).toHaveBeenCalledWith('灵渠API', 320, 201.6)
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    cleanup()
  })

  it('cancels the active frame and disconnects the resize observer on cleanup', () => {
    const context = createCanvasContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    const cancelAnimationFrame = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => undefined)
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(21)
    let disconnected = false
    class ResizeObserverMock {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {
        disconnected = true
      }
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    const stage = document.createElement('div')
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 640,
      bottom: 480,
      width: 640,
      height: 480,
    } as DOMRect)

    const cleanup = startHeroParticleEngine(
      stage,
      document.createElement('canvas'),
      document.createElement('canvas'),
      { x: -10000, y: -10000, active: false },
      false
    )
    cleanup()

    expect(cancelAnimationFrame).toHaveBeenCalledWith(21)
    expect(disconnected).toBe(true)
  })

  it('tracks pointer coordinates only while the pointer is over the hero', () => {
    const context = createCanvasContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(0)
    const stage = document.createElement('div')
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 50,
      right: 740,
      bottom: 530,
      width: 640,
      height: 480,
    } as DOMRect)
    const pointer = { x: -10000, y: -10000, active: false }
    const cleanup = startHeroParticleEngine(
      stage,
      document.createElement('canvas'),
      document.createElement('canvas'),
      pointer,
      false
    )

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 320, clientY: 200 })
    )
    expect(pointer).toMatchObject({ x: 220, y: 150, active: true })
    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 900, clientY: 200 })
    )
    expect(pointer.active).toBe(false)
    cleanup()
  })

  it('resizes both canvas backing stores when the hero dimensions change', () => {
    const context = createCanvasContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(0)
    let handleResize: () => void = () => undefined
    class ResizeObserverMock {
      constructor(callback: ResizeObserverCallback) {
        handleResize = () => callback([], this as unknown as ResizeObserver)
      }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    let width = 640
    const stage = document.createElement('div')
    vi.spyOn(stage, 'getBoundingClientRect').mockImplementation(
      () =>
        ({
          left: 0,
          top: 0,
          right: width,
          bottom: 480,
          width,
          height: 480,
        }) as DOMRect
    )
    const background = document.createElement('canvas')
    const text = document.createElement('canvas')
    const cleanup = startHeroParticleEngine(
      stage,
      background,
      text,
      { x: -10000, y: -10000, active: false },
      false
    )

    width = 720
    handleResize()

    expect(background.width).toBe(720)
    expect(text.width).toBe(720)
    cleanup()
  })
})
