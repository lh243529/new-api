type Pointer = { x: number; y: number; active: boolean }

type Particle = {
  x: number
  y: number
  vx: number
  baseVx: number
  radius: number
  alpha: number
  phase: number
  phaseSpeed: number
  zone: number
  depth: number
}

type TextParticle = {
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  color: string
}

type RGB = readonly [number, number, number]

type Meteor = {
  offset: number
  lane: number
  speed: number
  size: number
  image: HTMLImageElement
  trailColor: RGB
}

export type MeteorInteraction = {
  x: number
  y: number
  size: number
  color: RGB
}

export type MeteorInteractionChannel = {
  pointers: MeteorInteraction[]
  updatedAt: number
}

const ZONE_COLORS = [
  [0, 47, 167],
  [57, 197, 187],
  [102, 103, 171],
] as const

const MODEL_ICONS: ReadonlyArray<{
  path: string
  color: RGB
}> = [
  { path: '/model/claude.svg', color: [217, 119, 87] },
  { path: '/model/deepseek.svg', color: [77, 107, 254] },
  { path: '/model/openai.svg', color: [229, 231, 235] },
  { path: '/model/xai.svg', color: [203, 213, 225] },
  { path: '/model/zhipu.svg', color: [56, 89, 255] },
]

const MAX_BACKGROUND_CANVAS_PIXELS = 3_000_000
const MAX_TEXT_CANVAS_PIXELS = 2_000_000
const FRAME_INTERVAL = 1000 / 90

function getPixelRatio(
  width: number,
  height: number,
  preferredRatio: number,
  maxPixels: number
): number {
  const areaRatio = Math.sqrt(maxPixels / Math.max(1, width * height))
  return Math.max(0.5, Math.min(preferredRatio, areaRatio))
}

function createMeteors(width: number): Meteor[] {
  const count = width < 700 ? 10 : 18
  return Array.from({ length: count }, (_, index) => {
    const icon = MODEL_ICONS[Math.floor(Math.random() * MODEL_ICONS.length)]
    const image = new Image()
    image.src = icon.path
    return {
      offset: Math.random(),
      lane: 0.01 + ((index + Math.random() * 0.8) / count) * 0.98,
      speed: 0.00008 + Math.random() * 0.000045,
      size: 38 + Math.random() * 18,
      image,
      trailColor: icon.color,
    }
  })
}

function getParticleCount(width: number): number {
  if (width < 500) return 650
  if (width < 900) return 1000
  return 1600
}

function createParticles(width: number, height: number): Particle[] {
  const count = getParticleCount(width)
  return Array.from({ length: count }, (_, index) => {
    let zone = 2
    if (index < count * 0.4) zone = 0
    else if (index < count * 0.6) zone = 1
    const yMin = (height * zone) / 3
    const yMax = (height * (zone + 1)) / 3
    const depth = Math.floor(Math.random() * 3)
    const baseVx = 0.24 + Math.random() * 0.56
    return {
      x: Math.random() * width,
      y: yMin + Math.random() * (yMax - yMin),
      vx: baseVx,
      baseVx,
      radius: (0.5 + Math.random() * 1.3) * (0.6 + depth * 0.65),
      alpha: 0.18 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.005 + Math.random() * 0.014,
      zone,
      depth,
    }
  })
}

function createTextParticles(width: number, height: number): TextParticle[] {
  const offscreen = document.createElement('canvas')
  offscreen.width = Math.ceil(width)
  offscreen.height = Math.ceil(height)
  const offscreenContext = offscreen.getContext('2d', {
    willReadFrequently: true,
  })
  if (!offscreenContext) return []

  const fontSize = Math.max(52, Math.min(196, width * 0.28, height * 0.4))
  offscreenContext.font = `700 ${fontSize}px "Public Sans", "Microsoft YaHei", sans-serif`
  offscreenContext.textAlign = 'center'
  offscreenContext.textBaseline = 'middle'
  offscreenContext.fillStyle = '#fff'
  offscreenContext.fillText('灵渠API', width / 2, height * 0.42)

  const fullTextWidth =
    typeof offscreenContext.measureText === 'function'
      ? offscreenContext.measureText('灵渠API').width
      : width * 0.5
  const prefixWidth =
    typeof offscreenContext.measureText === 'function'
      ? offscreenContext.measureText('灵渠').width
      : fullTextWidth * 0.5
  const colorBoundary = width / 2 - fullTextWidth / 2 + prefixWidth

  const pixels = offscreenContext.getImageData(
    0,
    0,
    offscreen.width,
    offscreen.height
  )
  const step = width < 500 ? 4 : 3
  const points: TextParticle[] = []
  for (let y = 0; y < offscreen.height; y += step) {
    for (let x = 0; x < offscreen.width; x += step) {
      const alpha = pixels.data[(y * offscreen.width + x) * 4 + 3]
      if (alpha < 96) continue
      const targetX = x
      const targetY = y
      const angle = Math.random() * Math.PI * 2
      const distance = 24 + Math.random() * Math.min(width * 0.15, 120)
      const color =
        targetX <= colorBoundary
          ? 'rgba(125, 211, 252, 0.96)'
          : 'rgba(249, 115, 22, 0.96)'
      points.push({
        x: targetX + Math.cos(angle) * distance,
        y: targetY + Math.sin(angle) * distance,
        targetX,
        targetY,
        vx: 0,
        vy: 0,
        color,
      })
    }
  }
  return points
}

function resizeCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelRatio: number
): void {
  canvas.width = Math.round(width * pixelRatio)
  canvas.height = Math.round(height * pixelRatio)
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
}

function createZoneGlows(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
): CanvasGradient[] {
  return ZONE_COLORS.map((color, zone) => {
    const centerY = (height * (zone + 0.5)) / 3
    const glow = context.createRadialGradient(
      width / 2,
      centerY,
      0,
      width / 2,
      centerY,
      height * 0.43
    )
    glow.addColorStop(0, `rgba(${color.join(',')}, 0.04)`)
    glow.addColorStop(1, `rgba(${color.join(',')}, 0)`)
    return glow
  })
}

function drawBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  particles: Particle[],
  pointer: Pointer,
  frame: number,
  meteors: Meteor[],
  zoneGlows: CanvasGradient[],
  stageBounds: DOMRect | null,
  meteorChannel: MeteorInteractionChannel | null
): void {
  context.clearRect(0, 0, width, height)
  for (let zone = 0; zone < 3; zone++) {
    context.fillStyle = zoneGlows[zone]
    context.fillRect(0, 0, width, height)
  }

  context.strokeStyle = 'rgba(230, 150, 70, 0.035)'
  context.lineWidth = 1
  for (let x = -80; x < width + 80; x += 80) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x + 60, height)
    context.stroke()
  }

  for (const particle of particles) {
    if (pointer.active) {
      const dx = particle.x - pointer.x
      const dy = particle.y - pointer.y
      const distanceSquared = dx * dx + dy * dy
      if (distanceSquared < 10000 && distanceSquared > 1) {
        const distance = Math.sqrt(distanceSquared)
        const force = (1 - distance / 100) * 1.4
        particle.vx += (dx / distance) * force
        particle.y += (dy / distance) * force * 0.18
      }
    }
    particle.vx += (particle.baseVx - particle.vx) * 0.04
    particle.phase += particle.phaseSpeed
    particle.x += particle.vx
    const zoneMin = (height * particle.zone) / 3
    const zoneMax = (height * (particle.zone + 1)) / 3
    particle.y += Math.sin(particle.phase) * 0.12
    if (particle.y < zoneMin) particle.y = zoneMax
    if (particle.y > zoneMax) particle.y = zoneMin
    if (particle.x > width + 4) particle.x = -4

    const rgb = ZONE_COLORS[particle.zone].join(',')
    const alpha = particle.alpha * (0.72 + 0.28 * Math.sin(particle.phase))
    if (particle.depth > 0) {
      context.fillStyle = `rgba(${rgb}, ${alpha * 0.12})`
      context.beginPath()
      context.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2)
      context.fill()
    }
    context.fillStyle = `rgba(${rgb}, ${alpha})`
    context.beginPath()
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
    context.fill()
  }

  const meteorPointers: MeteorInteraction[] = []
  for (const meteor of meteors) {
    const cometX =
      ((frame * meteor.speed + meteor.offset) % 1.2) * (width + 180) - 90
    const lane = Math.min(
      0.99,
      Math.max(
        0.01,
        meteor.lane + Math.sin(frame * 0.00018 + meteor.offset * 8) * 0.025
      )
    )
    const cometY = height * lane
    if (stageBounds && meteorChannel) {
      meteorPointers.push({
        x: stageBounds.left + cometX,
        y: stageBounds.top + cometY,
        size: meteor.size,
        color: meteor.trailColor,
      })
    }
    const trailLength = meteor.size * 4.2
    const [red, green, blue] = meteor.trailColor
    const trail = context.createLinearGradient(
      cometX - trailLength,
      cometY,
      cometX,
      cometY
    )
    trail.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0)`)
    trail.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0.72)`)
    context.strokeStyle = trail
    context.lineWidth = 1.5
    context.beginPath()
    context.moveTo(cometX - trailLength, cometY)
    context.lineTo(cometX, cometY)
    context.stroke()

    if (
      meteor.image.complete &&
      meteor.image.naturalWidth > 0 &&
      typeof context.drawImage === 'function'
    ) {
      context.save()
      context.globalAlpha = 0.9
      context.shadowColor = `rgba(${red}, ${green}, ${blue}, 0.65)`
      context.shadowBlur = 10
      context.drawImage(
        meteor.image,
        cometX - meteor.size / 2,
        cometY - meteor.size / 2,
        meteor.size,
        meteor.size
      )
      context.restore()
    }
  }
  if (meteorChannel) {
    meteorChannel.pointers = meteorPointers
    meteorChannel.updatedAt = frame
  }
}

const TEXT_INTERACTION_RADIUS = 80
const TEXT_INTERACTION_FORCE = 1.8

export function applyTextPointerForce(
  particle: TextParticle,
  pointerX: number,
  pointerY: number
): void {
  const dx = particle.x - pointerX
  const dy = particle.y - pointerY
  const distanceSquared = dx * dx + dy * dy
  if (
    distanceSquared < TEXT_INTERACTION_RADIUS * TEXT_INTERACTION_RADIUS &&
    distanceSquared > 1
  ) {
    const distance = Math.sqrt(distanceSquared)
    const force =
      (1 - distance / TEXT_INTERACTION_RADIUS) * TEXT_INTERACTION_FORCE
    particle.vx += (dx / distance) * force
    particle.vy += (dy / distance) * force
  }
}

function drawText(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  particles: TextParticle[],
  pointer: Pointer,
  meteorPointers: Array<{ x: number; y: number }>
): void {
  context.clearRect(0, 0, width, height)
  for (const particle of particles) {
    if (pointer.active) {
      applyTextPointerForce(particle, pointer.x, pointer.y)
    }
    for (const meteor of meteorPointers) {
      applyTextPointerForce(particle, meteor.x, meteor.y)
    }
    particle.vx += (particle.targetX - particle.x) * 0.018
    particle.vy += (particle.targetY - particle.y) * 0.018
    particle.vx *= 0.86
    particle.vy *= 0.86
    particle.x += particle.vx
    particle.y += particle.vy
    context.fillStyle = particle.color
    context.fillRect(particle.x, particle.y, 2, 2)
  }
}

export function startHeroParticleEngine(
  stage: HTMLElement,
  backgroundCanvas: HTMLCanvasElement | null,
  textCanvas: HTMLCanvasElement | null,
  pointer: Pointer,
  reducedMotion: boolean,
  meteorChannel: MeteorInteractionChannel | null = null
): () => void {
  const backgroundContext = backgroundCanvas?.getContext('2d') ?? null
  const textContext = textCanvas?.getContext('2d') ?? null
  if (
    (!backgroundContext || !backgroundCanvas) &&
    (!textContext || !textCanvas)
  ) {
    return () => undefined
  }

  let frame = 0
  let animationId = 0
  let lastRenderTime = Number.NEGATIVE_INFINITY
  let width = 0
  let height = 0
  let backgroundParticles: Particle[] = []
  let textParticles: TextParticle[] = []
  let meteors: Meteor[] = []
  let zoneGlows: CanvasGradient[] = []
  let disposed = false
  let pageVisible = !document.hidden
  const preferredPixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  const render = (time: number) => {
    if (disposed || !pageVisible) return
    frame = time
    if (time - lastRenderTime >= FRAME_INTERVAL) {
      lastRenderTime = time
      const stageBounds =
        (backgroundContext && meteorChannel) || textContext
          ? stage.getBoundingClientRect()
          : null
      if (backgroundContext) {
        drawBackground(
          backgroundContext,
          width,
          height,
          backgroundParticles,
          pointer,
          frame,
          meteors,
          zoneGlows,
          stageBounds,
          meteorChannel
        )
      }
      if (textContext) {
        const meteorPointers =
          !reducedMotion && meteorChannel && stageBounds
            ? meteorChannel.pointers
                .filter(
                  (meteor) =>
                    meteor.x >= stageBounds.left - TEXT_INTERACTION_RADIUS &&
                    meteor.x <= stageBounds.right + TEXT_INTERACTION_RADIUS &&
                    meteor.y >= stageBounds.top - TEXT_INTERACTION_RADIUS &&
                    meteor.y <= stageBounds.bottom + TEXT_INTERACTION_RADIUS
                )
                .map((meteor) => ({
                  x: meteor.x - stageBounds.left,
                  y: meteor.y - stageBounds.top,
                }))
            : []
        drawText(
          textContext,
          width,
          height,
          textParticles,
          pointer,
          meteorPointers
        )
      }
    }
    if (!reducedMotion) animationId = window.requestAnimationFrame(render)
  }

  const resize = () => {
    const bounds = stage.getBoundingClientRect()
    width = Math.max(1, bounds.width)
    height = Math.max(1, bounds.height)
    if (backgroundCanvas && backgroundContext) {
      const backgroundPixelRatio = getPixelRatio(
        width,
        height,
        preferredPixelRatio,
        MAX_BACKGROUND_CANVAS_PIXELS
      )
      resizeCanvas(
        backgroundCanvas,
        backgroundContext,
        width,
        height,
        backgroundPixelRatio
      )
      zoneGlows = createZoneGlows(backgroundContext, width, height)
      backgroundParticles = createParticles(width, height)
      meteors = createMeteors(width)
    }
    if (textCanvas && textContext) {
      const textPixelRatio = getPixelRatio(
        width,
        height,
        Math.min(preferredPixelRatio, 1.5),
        MAX_TEXT_CANVAS_PIXELS
      )
      resizeCanvas(textCanvas, textContext, width, height, textPixelRatio)
      textParticles = createTextParticles(width, height)
    }
    if (reducedMotion) {
      for (const particle of textParticles) {
        particle.x = particle.targetX
        particle.y = particle.targetY
      }
      render(0)
    }
  }

  const observer = new ResizeObserver(resize)
  observer.observe(stage)
  resize()
  if (!reducedMotion) animationId = window.requestAnimationFrame(render)

  const handlePointerMove = (event: PointerEvent) => {
    const bounds = stage.getBoundingClientRect()
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      pointer.active = false
      return
    }
    pointer.x = event.clientX - bounds.left
    pointer.y = event.clientY - bounds.top
    pointer.active = true
  }
  const clearPointer = () => {
    pointer.active = false
  }
  const handleVisibilityChange = () => {
    pageVisible = !document.hidden
    if (pageVisible && !reducedMotion) {
      lastRenderTime = Number.NEGATIVE_INFINITY
      animationId = window.requestAnimationFrame(render)
    } else {
      window.cancelAnimationFrame(animationId)
      animationId = 0
    }
  }
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('blur', clearPointer)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  return () => {
    disposed = true
    window.cancelAnimationFrame(animationId)
    if (backgroundContext && meteorChannel) {
      meteorChannel.pointers = []
      meteorChannel.updatedAt = 0
    }
    observer.disconnect()
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('blur', clearPointer)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}
