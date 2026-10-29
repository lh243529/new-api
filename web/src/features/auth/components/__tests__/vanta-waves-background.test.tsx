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
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { VantaWavesOptions } from 'vanta/src/vanta.waves.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthLayout } from '../../auth-layout'
import * as loader from '../vanta-waves'
import { VantaWavesBackground } from '../vanta-waves-background'

const { waves } = vi.hoisted(() => ({ waves: vi.fn() }))
vi.mock('vanta/src/vanta.waves.js', () => ({ default: waves }))
vi.mock('three', () => ({ REVISION: '134' }))
vi.mock('@/hooks/use-system-config', () => ({
  useSystemConfig: () => ({
    systemName: '奇流API',
    logo: '/logo.png',
    loading: false,
  }),
}))
vi.mock('@tanstack/react-router', () => ({
  Link: (props: {
    children: React.ReactNode
    to: string
    className?: string
  }) => (
    <a href={props.to} className={props.className}>
      {props.children}
    </a>
  ),
}))

let reduced = false
let hidden = false
let motionListeners: Set<() => void>
const effects: ReturnType<typeof makeEffect>[] = []

function makeEffect(options: VantaWavesOptions) {
  const canvas = document.createElement('canvas')
  options.el.appendChild(canvas)
  const renderer = {
    domElement: canvas,
    dispose: vi.fn(),
    forceContextLoss: vi.fn(),
  }
  const effect = {
    renderer,
    resize: vi.fn(),
    destroy: vi.fn(() => canvas.remove()),
  }
  return effect
}

beforeEach(() => {
  reduced = false
  hidden = false
  effects.length = 0
  motionListeners = new Set()
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        get matches() {
          return reduced
        },
        media: query,
        addEventListener: (_: string, listener: () => void) =>
          motionListeners.add(listener),
        removeEventListener: (_: string, listener: () => void) =>
          motionListeners.delete(listener),
      }) as unknown as MediaQueryList
  )
  waves.mockReset()
  waves.mockImplementation((options: VantaWavesOptions) => {
    const effect = makeEffect(options)
    effects.push(effect)
    return effect
  })
})

afterEach(() => vi.restoreAllMocks())

describe('WAVES authentication background', () => {
  it('uses the requested parameters, keeps one canvas, and releases GPU resources on unmount', async () => {
    const { container, unmount } = render(<VantaWavesBackground />)
    await waitFor(() => expect(waves).toHaveBeenCalledOnce())
    expect(waves.mock.calls[0][0]).toMatchObject({
      color: 0x005588,
      shininess: 30,
      waveHeight: 20,
      waveSpeed: 1,
      zoom: 1,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1,
      scaleMobile: 1,
      THREE: { REVISION: '134' },
    })
    expect(container.querySelectorAll('canvas')).toHaveLength(1)
    const background = container.querySelector(
      '[data-slot="auth-waves-background"]'
    )
    expect(background).toHaveAttribute('aria-hidden', 'true')
    expect(background).toHaveClass('pointer-events-none', 'fixed')
    const remove = vi.spyOn(document, 'removeEventListener')
    unmount()
    expect(effects[0].destroy).toHaveBeenCalledOnce()
    expect(effects[0].renderer.dispose).toHaveBeenCalledOnce()
    expect(effects[0].renderer.forceContextLoss).toHaveBeenCalledOnce()
    expect(motionListeners.size).toBe(0)
    expect(remove).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    )
  })

  it('destroys while hidden and creates a fresh single canvas on return', async () => {
    const { container } = render(<VantaWavesBackground />)
    await waitFor(() => expect(waves).toHaveBeenCalledOnce())
    hidden = true
    fireEvent(document, new Event('visibilitychange'))
    expect(effects[0].destroy).toHaveBeenCalledOnce()
    expect(container.querySelectorAll('canvas')).toHaveLength(0)
    hidden = false
    fireEvent(document, new Event('visibilitychange'))
    await waitFor(() => expect(waves).toHaveBeenCalledTimes(2))
    expect(container.querySelectorAll('canvas')).toHaveLength(1)
  })

  it('uses static blue for reduced motion and responds to preference changes', async () => {
    reduced = true
    const { container } = render(<VantaWavesBackground />)
    await act(async () => {})
    expect(waves).not.toHaveBeenCalled()
    expect(container.firstChild).toHaveClass('bg-[#005588]')
    reduced = false
    act(() => motionListeners.forEach((listener) => listener()))
    await waitFor(() => expect(waves).toHaveBeenCalledOnce())
    reduced = true
    act(() => motionListeners.forEach((listener) => listener()))
    expect(effects[0].destroy).toHaveBeenCalledOnce()
  })

  it('does not initialize after async loading finishes on an unmounted page', async () => {
    const create = vi.fn(() => vi.fn())
    let resolveLoad: (value: typeof create) => void = () => {}
    vi.spyOn(loader, 'loadVantaWaves').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLoad = resolve
        })
    )
    const { unmount } = render(<VantaWavesBackground />)
    unmount()
    await act(async () => resolveLoad(create))
    expect(create).not.toHaveBeenCalled()
  })

  it('keeps the fallback when loading or WebGL creation fails', async () => {
    vi.spyOn(loader, 'loadVantaWaves').mockRejectedValueOnce(
      new Error('network failure')
    )
    const first = render(<VantaWavesBackground />)
    await act(async () => {})
    expect(first.container.querySelector('canvas')).toBeNull()
    first.unmount()
    waves.mockImplementationOnce(() => {
      throw new Error('WebGL unavailable')
    })
    const second = render(<VantaWavesBackground />)
    await act(async () => {})
    expect(second.container.firstChild).toHaveClass('bg-[#005588]')
    expect(second.container.querySelector('canvas')).toBeNull()
  })

  it('does not let an older rejected load clear a newer live canvas', async () => {
    let rejectLoad: (reason: Error) => void = () => {}
    const original = loader.loadVantaWaves
    vi.spyOn(loader, 'loadVantaWaves')
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectLoad = reject
          })
      )
      .mockImplementation(original)
    const { container } = render(<VantaWavesBackground />)
    hidden = true
    fireEvent(document, new Event('visibilitychange'))
    hidden = false
    fireEvent(document, new Event('visibilitychange'))
    await waitFor(() => expect(waves).toHaveBeenCalledOnce())
    await act(async () => rejectLoad(new Error('stale load')))
    expect(container.querySelectorAll('canvas')).toHaveLength(1)
  })
})

describe('authentication layout scope', () => {
  it('keeps ordinary authentication pages without waves or a card', () => {
    const { container } = render(
      <AuthLayout>
        <input aria-label='Email' />
      </AuthLayout>
    )
    expect(
      container.querySelector('[data-slot="auth-waves-background"]')
    ).toBeNull()
    expect(container.querySelector('[data-slot="card"]')).toBeNull()
    expect(screen.getByRole('heading', { name: '奇流API' })).not.toHaveClass(
      'text-white'
    )
  })

  it('adds a translucent theme surface without blocking form input', async () => {
    const { container } = render(
      <AuthLayout background='waves'>
        <input aria-label='Email' />
      </AuthLayout>
    )
    await waitFor(() => expect(waves).toHaveBeenCalledOnce())
    expect(container.querySelector('[data-slot="card"]')).toHaveClass(
      'bg-background/80'
    )
    expect(container.querySelector('a')).toHaveClass('text-white')
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
      target: { value: 'preview@example.test' },
    })
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue(
      'preview@example.test'
    )
  })
})
