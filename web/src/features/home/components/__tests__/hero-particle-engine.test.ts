import { afterEach, assert, describe, expect, it, vi } from 'vitest'

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
    closePath: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(
      (text: string) =>
        ({
          width: text === '奇流' ? 50 : 100,
        }) as TextMetrics
    ),
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
    const textColors = new Set<string | CanvasGradient | CanvasPattern>()
    vi.mocked(context.fillRect).mockImplementation((_x, _y, width, height) => {
      if (width === 2 && height === 2) textColors.add(context.fillStyle)
    })
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
    expect(context.fillText).toHaveBeenCalledWith('奇流API', 320, 201.6)
    expect(context.measureText).toHaveBeenCalledWith('奇流API')
    expect(context.measureText).toHaveBeenCalledWith('奇流')
    expect(textColors).toEqual(
      new Set(['rgba(125, 211, 252, 0.96)', 'rgba(249, 115, 22, 0.96)'])
    )
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    cleanup()
  })

  it('fits the full title within a narrow canvas with room on both sides', () => {
    const context = createCanvasContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    vi.mocked(context.measureText).mockImplementation((text) => {
      const fontSize = Number(context.font.match(/([\d.]+)px/)?.[1])
      return { width: fontSize * (text === '奇流' ? 2 : 4) } as TextMetrics
    })
    let drawnTextWidth = 0
    vi.mocked(context.fillText).mockImplementation((text) => {
      drawnTextWidth = context.measureText(text).width
    })
    const stage = document.createElement('div')
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 390,
      bottom: 480,
      width: 390,
      height: 480,
    } as DOMRect)

    const cleanup = startHeroParticleEngine(
      stage,
      null,
      document.createElement('canvas'),
      { x: -10000, y: -10000, active: false },
      true
    )

    expect(context.fillText).toHaveBeenCalledWith('奇流API', 195, 201.6)
    expect(drawnTextWidth).toBeGreaterThan(0)
    expect(drawnTextWidth).toBeLessThanOrEqual(374)
    cleanup()
  })

  it.each(['rgba(203, 213, 225, 0.98)', 'rgba(51, 65, 85, 0.98)'])(
    'draws a smaller centered particle tagline in the supplied theme color %s',
    (taglineColor) => {
      const context = createCanvasContext()
      const data = new Uint8ClampedArray(640 * 480 * 4)
      data[(360 * 640 + 320) * 4 + 3] = 255
      vi.mocked(context.getImageData).mockReturnValue({ data } as ImageData)
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
        context
      )
      const textDraws: Array<{
        text: string
        font: string
        x: number
        y: number
      }> = []
      vi.mocked(context.fillText).mockImplementation((text, x, y) => {
        textDraws.push({ text, font: context.font, x, y })
      })
      const particleColors = new Set<string | CanvasGradient | CanvasPattern>()
      vi.mocked(context.fillRect).mockImplementation(() => {
        particleColors.add(context.fillStyle)
      })
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

      const cleanup = startHeroParticleEngine(
        stage,
        null,
        document.createElement('canvas'),
        { x: -10000, y: -10000, active: false },
        true,
        null,
        { tagline: '千奇汇流，一路直达', taglineColor }
      )

      const title = textDraws.find((draw) => draw.text === '奇流API')
      const tagline = textDraws.find(
        (draw) => draw.text === '千奇汇流，一路直达'
      )
      assert.isDefined(title)
      assert.isDefined(tagline)
      expect(tagline.x).toBe(320)
      expect(tagline.y).toBeGreaterThan(title.y)
      expect(tagline.y).toBeLessThan(480 * 0.75)
      expect(Number(tagline.font.match(/([\d.]+)px/)?.[1])).toBeLessThan(
        Number(title.font.match(/([\d.]+)px/)?.[1])
      )
      expect(particleColors).toEqual(new Set([taglineColor]))
      expect(requestAnimationFrame).not.toHaveBeenCalled()
      cleanup()
    }
  )

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
    const meteor = channel.pointers.at(-1)
    assert.isDefined(meteor)
    const x = meteor.x - 10
    const y = meteor.y - 20
    expect(context.moveTo).toHaveBeenCalledWith(x - 38 * 4.2, y)
    expect(context.lineTo).toHaveBeenCalledWith(x, y - 38 / 8)
    expect(context.lineTo).toHaveBeenLastCalledWith(x, y + 38 / 8)
    expect(context.closePath).toHaveBeenCalledTimes(18)
    expect(context.fill).toHaveBeenLastCalledWith()
    cleanup()
  })

  it.each([
    { width: 499, particleCount: 433, meteorCount: 10 },
    { width: 500, particleCount: 667, meteorCount: 10 },
    { width: 899, particleCount: 667, meteorCount: 18 },
    { width: 900, particleCount: 1067, meteorCount: 18 },
  ])(
    'draws $particleCount background particles at width $width',
    ({ width, particleCount, meteorCount }) => {
      const context = createCanvasContext()
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
        context
      )
      // A fixed random value disables particle halos, so each arc is one particle.
      vi.spyOn(Math, 'random').mockReturnValue(0)
      const stage = document.createElement('div')
      vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        right: width,
        bottom: 480,
        width,
        height: 480,
      } as DOMRect)
      const cleanup = startHeroParticleEngine(
        stage,
        document.createElement('canvas'),
        null,
        { x: -10000, y: -10000, active: false },
        true
      )

      expect(context.arc).toHaveBeenCalledTimes(particleCount)
      expect(context.createLinearGradient).toHaveBeenCalledTimes(meteorCount)
      cleanup()
    }
  )

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
