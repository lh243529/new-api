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

import { useTheme } from '@/context/theme-provider'

import {
  type MeteorInteractionChannel,
  startHeroParticleEngine,
} from './hero-particle-engine'

interface HeroParticleSceneProps {
  mode?: 'both' | 'background' | 'text'
  meteorChannel?: MeteorInteractionChannel
  tagline?: string
}

export function HeroParticleScene(props: HeroParticleSceneProps) {
  const { resolvedTheme } = useTheme()
  let taglineColor: string | undefined
  if (props.tagline) {
    taglineColor =
      resolvedTheme === 'dark'
        ? 'rgba(203, 213, 225, 0.98)'
        : 'rgba(51, 65, 85, 0.98)'
  }
  const stageRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: -10000, y: -10000, active: false })

  useEffect(() => {
    const stage = stageRef.current
    const background = props.mode === 'text' ? null : backgroundRef.current
    const text = props.mode === 'background' ? null : textRef.current
    if (!stage) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    return startHeroParticleEngine(
      stage,
      background,
      text,
      pointerRef.current,
      reducedMotion,
      props.meteorChannel ?? null,
      { tagline: props.tagline, taglineColor }
    )
  }, [props.mode, props.meteorChannel, props.tagline, taglineColor])

  return (
    <div
      ref={stageRef}
      className={`absolute inset-0 ${props.mode === 'background' ? 'pointer-events-none' : ''}`}
      aria-hidden='true'
    >
      {props.mode !== 'text' && (
        <canvas ref={backgroundRef} className='absolute inset-0 size-full' />
      )}
      {props.mode !== 'background' && (
        <canvas ref={textRef} className='absolute inset-0 size-full' />
      )}
    </div>
  )
}
