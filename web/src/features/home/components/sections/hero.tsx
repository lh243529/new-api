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
import { CherryStudio } from '@lobehub/icons'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import type { MeteorInteractionChannel } from '../hero-particle-engine'
import { HeroParticleScene } from '../hero-particle-scene'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
  meteorChannel?: MeteorInteractionChannel
}

// Stylized three-dots indicator representing "More"
const MoreIcon = () => (
  <svg
    className='text-muted-foreground/60 group-hover:text-foreground size-6 shrink-0 transition-colors'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <circle cx='6' cy='12' r='2' fill='currentColor' />
    <circle cx='12' cy='12' r='2' fill='currentColor' />
    <circle cx='18' cy='12' r='2' fill='currentColor' />
  </svg>
)

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const tagline = t('A thousand possibilities, one direct path')

  return (
    <section className='relative isolate z-10 min-h-[680px] overflow-hidden px-6 pt-24 pb-14 md:min-h-[760px] md:pt-28 md:pb-16'>
      <HeroParticleScene
        mode='text'
        meteorChannel={props.meteorChannel}
        tagline={tagline}
      />
      <div className='relative z-10 mx-auto flex max-w-5xl flex-col items-center pt-[340px] text-center md:pt-[380px]'>
        <h1 className='sr-only'>奇流API</h1>
        <p className='sr-only'>{tagline}</p>
        <div
          className='landing-animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3 opacity-0'
          style={{ animationDelay: '180ms' }}
        >
          {props.isAuthenticated ? (
            <Button
              className='group h-11 rounded-lg px-5 text-sm font-medium'
              render={<Link to='/dashboard' />}
            >
              {t('Go to Dashboard')}
              <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
            </Button>
          ) : (
            <>
              <Button
                className='group h-11 rounded-lg px-5 text-sm font-medium'
                render={<Link to='/sign-up' />}
              >
                {t('Get Started')}
                <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
              </Button>
              <Button
                variant='outline'
                className='border-border/50 hover:border-border hover:bg-muted/50 h-11 rounded-lg px-5 text-sm font-medium'
                render={<Link to='/pricing' />}
              >
                {t('View Pricing')}
              </Button>
            </>
          )}
        </div>

        <div
          className='landing-animate-fade-up mt-10 w-full max-w-3xl opacity-0'
          style={{ animationDelay: '240ms' }}
        >
          <div className='mb-4 flex flex-col items-center gap-1'>
            <span className='text-muted-foreground/50 text-[10px] font-bold tracking-[0.15em] uppercase'>
              {t('Supported Applications')}
            </span>
            <p className='text-muted-foreground/60 text-xs leading-relaxed'>
              {t(
                'Supports one-click configuration and perfectly adapts to NewAPI multi-protocol configuration.'
              )}
            </p>
          </div>
          <div className='flex flex-wrap items-center justify-center gap-3'>
            <a
              href='https://cherry-ai.com'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Cherry Studio'
              className='group border-border/40 bg-muted/15 text-foreground/80 hover:border-border hover:bg-muted/30 hover:text-foreground flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-medium shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] backdrop-blur-xs transition-all duration-300 hover:scale-[1.02]'
            >
              <CherryStudio.Color size={24} className='shrink-0' />
              <span>Cherry Studio</span>
            </a>
            <a
              href='https://ccswitch.io'
              target='_blank'
              rel='noopener noreferrer'
              className='group border-border/40 bg-muted/15 text-foreground/80 hover:border-border hover:bg-muted/30 hover:text-foreground flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-medium shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] backdrop-blur-xs transition-all duration-300 hover:scale-[1.02]'
            >
              <img
                src='https://ccswitch.io/favicon.png'
                alt=''
                className='size-6 shrink-0 rounded-md object-contain'
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <span
                style={{ display: 'none' }}
                className='size-6 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400'
              >
                CC
              </span>
              <span>CC Switch</span>
            </a>
            <div className='group border-border/40 bg-muted/15 text-foreground/55 hover:border-border hover:bg-muted/30 hover:text-foreground flex cursor-default items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-medium shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] backdrop-blur-xs transition-all duration-300 hover:scale-[1.02]'>
              <MoreIcon />
              <span>{t('More Apps')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
