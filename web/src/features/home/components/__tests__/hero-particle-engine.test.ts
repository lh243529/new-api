import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  applyTextPointerForce,
  startHeroParticleEngine,
  type MeteorInteractionChannel,
} from '../hero-particle-engine'

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

  it('limits background and text draws to 90 FPS', () => {
    const backgroundContext = createCanvasContext()
    const textContext = createCanvasContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValueOnce(backgroundContext)
      .mockReturnValueOnce(textContext)
    let renderFrame: FrameRequestCallback | undefined
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      renderFrame = callback
      return 21
    })
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

    renderFrame?.(0)
    expect(backgroundContext.clearRect).toHaveBeenCalledTimes(1)
    expect(textContext.clearRect).toHaveBeenCalledTimes(1)
    renderFrame?.(8)
    expect(backgroundContext.clearRect).toHaveBeenCalledTimes(1)
    expect(textContext.clearRect).toHaveBeenCalledTimes(1)
    renderFrame?.(11)
    expect(backgroundContext.clearRect).toHaveBeenCalledTimes(1)
    expect(textContext.clearRect).toHaveBeenCalledTimes(1)
    renderFrame?.(12)
    expect(backgroundContext.clearRect).toHaveBeenCalledTimes(2)
    expect(textContext.clearRect).toHaveBeenCalledTimes(2)

    cleanup()
  })

  it('publishes meteor coordinates and uses the icon color for the trail', () => {
    const context = createCanvasContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    let renderFrame: FrameRequestCallback | undefined
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      renderFrame = callback
      return 21
    })
    const stage = document.createElement('div')
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 20,
      right: 810,
      bottom: 500,
      width: 800,
      height: 480,
    } as DOMRect)
    const channel: MeteorInteractionChannel = { pointers: [], updatedAt: 0 }
    const cleanup = startHeroParticleEngine(
      stage,
      document.createElement('canvas'),
      null,
      { x: -10000, y: -10000, active: false },
      false,
      channel
    )

    renderFrame?.(0)

    expect(channel.pointers).toHaveLength(18)
    expect(channel.pointers[0]).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
      size: 38,
      color: [217, 119, 87],
    })
    const linearGradient = vi.mocked(context.createLinearGradient).mock
      .results[0]?.value as CanvasGradient & {
      addColorStop: ReturnType<typeof vi.fn>
    }
    expect(linearGradient.addColorStop).toHaveBeenCalledWith(
      0,
      'rgba(217, 119, 87, 0)'
    )
    expect(linearGradient.addColorStop).toHaveBeenCalledWith(
      1,
      'rgba(217, 119, 87, 0.72)'
    )
    cleanup()
  })

  it('repels text particles when a shared meteor crosses the title', () => {
    const context = createCanvasContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    let renderFrame: FrameRequestCallback | undefined
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      renderFrame = callback
      return 21
    })
    const stage = document.createElement('div')
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 640,
      bottom: 480,
      width: 640,
      height: 480,
    } as DOMRect)
    const channel: MeteorInteractionChannel = {
      pointers: [{ x: 320, y: 147, size: 38, color: [77, 107, 254] as const }],
      updatedAt: 0,
    }
    const cleanup = startHeroParticleEngine(
      stage,
      null,
      document.createElement('canvas'),
      { x: -10000, y: -10000, active: false },
      false,
      channel
    )

    renderFrame?.(0)

    const textDraws = vi
      .mocked(context.fillRect)
      .mock.calls.find((call) => call[2] === 2 && call[3] === 2)
    expect(textDraws?.[0]).toBeGreaterThan(342)
    cleanup()
  })

  it('applies the same repulsion force to meteor and mouse pointers', () => {
    const particle = {
      x: 40,
      y: 0,
      targetX: 40,
      targetY: 0,
      vx: 0,
      vy: 0,
      color: '',
    }

    applyTextPointerForce(particle, 0, 0)

    expect(particle.vx).toBeCloseTo(0.9)
    expect(particle.vy).toBe(0)
  })

  it('clears published meteors when the background engine is disposed', () => {
    const context = createCanvasContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(21)
    const channel: MeteorInteractionChannel = {
      pointers: [{ x: 1, y: 1, size: 40, color: [1, 2, 3] as const }],
      updatedAt: 10,
    }
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
      null,
      { x: -10000, y: -10000, active: false },
      false,
      channel
    )

    cleanup()

    expect(channel).toEqual({ pointers: [], updatedAt: 0 })
  })

  it('resumes drawing immediately when the page becomes visible again', () => {
    const context = createCanvasContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    let renderFrame: FrameRequestCallback | undefined
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      renderFrame = callback
      return 21
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
    let hidden = false
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
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

    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    renderFrame?.(0)

    expect(context.clearRect).toHaveBeenCalledTimes(2)
    cleanup()
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
