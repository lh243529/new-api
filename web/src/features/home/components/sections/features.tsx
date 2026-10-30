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
import {
  ArrowRight,
  Blocks,
  Check,
  Code,
  KeyRound,
  MessagesSquare,
  PenLine,
  Plug,
  ReceiptText,
  Terminal,
  Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { HOME_PROVIDERS } from '../../constants'

export function Features() {
  const { t } = useTranslation()

  const features = [
    {
      id: 'models',
      num: '01',
      title: t('Many models, one connection'),
      desc: t(
        'Access five model providers through QiFlow and choose the right model for each task.'
      ),
      span: 'md:col-span-2',
      visual: (
        <div
          role='img'
          aria-label={t(
            'Five providers, through QiFlow, to your tools and apps'
          )}
          className='mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4'
        >
          <div className='flex -space-x-2' aria-hidden='true'>
            {HOME_PROVIDERS.map((provider) => (
              <div
                key={provider.name}
                className='border-border bg-background flex size-10 items-center justify-center rounded-full border'
              >
                <img
                  src={provider.icon}
                  alt=''
                  width={22}
                  height={22}
                  loading='lazy'
                  className={cn(
                    'size-[22px]',
                    provider.monochrome && 'dark:invert'
                  )}
                />
              </div>
            ))}
          </div>
          <ArrowRight
            aria-hidden='true'
            className='text-muted-foreground size-4 shrink-0 rotate-90 sm:rotate-0'
          />
          <div className='border-primary/25 bg-primary/5 text-primary rounded-xl border px-5 py-3 text-sm font-semibold'>
            {t('QiFlow')}
          </div>
          <ArrowRight
            aria-hidden='true'
            className='text-muted-foreground size-4 shrink-0 rotate-90 sm:rotate-0'
          />
          <span className='text-muted-foreground text-center text-xs font-medium'>
            {t('Your tools and apps')}
          </span>
        </div>
      ),
    },
    {
      id: 'tools',
      num: '02',
      title: t('Familiar tools, simple setup'),
      desc: t(
        'Configure Cherry Studio, CC Switch, and other tools with the appropriate API endpoint and key.'
      ),
      span: 'md:col-span-1',
      visual: (
        <div className='mt-6 space-y-3'>
          <div className='flex flex-wrap gap-2'>
            {['Cherry Studio', 'CC Switch'].map((name) => (
              <Badge
                key={name}
                variant='outline'
                className='h-auto rounded-lg px-3 py-2 text-xs'
              >
                <Plug aria-hidden='true' />
                {name}
              </Badge>
            ))}
          </div>
          <p className='text-muted-foreground flex items-center gap-2 text-xs'>
            <KeyRound
              aria-hidden='true'
              className='text-primary size-3.5 shrink-0'
            />
            {t('Your endpoint. Your API key.')}
          </p>
        </div>
      ),
    },
    {
      id: 'development',
      num: '03',
      title: t('A clear path from app to API'),
      desc: t(
        'Follow your client or SDK configuration to set the API endpoint, key, and model name.'
      ),
      span: 'md:col-span-1',
      visual: (
        <ul className='mt-6 space-y-3'>
          {[t('API endpoint'), t('API key'), t('Model name')].map((label) => (
            <li
              key={label}
              className='text-muted-foreground flex items-center gap-2.5 text-xs'
            >
              <Check
                aria-hidden='true'
                className='text-primary size-3.5 shrink-0'
              />
              {label}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'usage',
      num: '04',
      title: t('Know what you use'),
      desc: t(
        'View your balance, request history, and usage costs in the console to understand each call.'
      ),
      span: 'md:col-span-2',
      visual: (
        <div className='border-border/40 mt-6 grid grid-cols-3 divide-x rounded-lg border py-4'>
          {[
            { label: t('Balance'), icon: Wallet },
            { label: t('Request history'), icon: ReceiptText },
            { label: t('Usage costs'), icon: Code },
          ].map((item) => (
            <div
              key={item.label}
              className='flex min-w-0 flex-col items-center gap-2 px-2 text-center'
            >
              <item.icon
                aria-hidden='true'
                className='text-primary size-5'
                strokeWidth={1.5}
              />
              <span className='text-muted-foreground text-xs leading-relaxed'>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ]

  const scenarios = [
    {
      icon: MessagesSquare,
      title: t('Everyday conversations'),
      desc: t('Explore ideas, ask questions, and find a new perspective.'),
    },
    {
      icon: Terminal,
      title: t('Coding assistance'),
      desc: t('Bring model assistance into your coding workflow.'),
    },
    {
      icon: PenLine,
      title: t('Content creation'),
      desc: t('Draft, rewrite, and organize your next piece of content.'),
    },
    {
      icon: Blocks,
      title: t('Application development'),
      desc: t('Connect models to the products and workflows you build.'),
    },
  ]

  return (
    <section
      className='relative z-10 px-6 py-24 md:py-32'
      aria-label={t('QiFlow services')}
    >
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-16 max-w-xl'>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {t(
              'One clear path from model selection to tool setup, application calls, and usage tracking.'
            )}
          </p>
        </AnimateInView>

        <div className='border-border/40 bg-border/40 grid gap-px overflow-hidden rounded-xl border md:grid-cols-3'>
          {features.map((feature, i) => (
            <AnimateInView
              key={feature.id}
              delay={i * 100}
              animation='scale-in'
              className={cn(
                'bg-background group min-w-0 p-7 transition-colors duration-300 hover:bg-muted/20 md:p-8',
                feature.span
              )}
            >
              <div className='mb-3 flex items-center gap-3'>
                <span className='border-border/40 bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold tabular-nums'>
                  {feature.num}
                </span>
                <h3 className='text-sm font-semibold'>{feature.title}</h3>
              </div>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {feature.desc}
              </p>
              {feature.visual}
            </AnimateInView>
          ))}
        </div>

        <div className='mt-12 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12'>
          {scenarios.map((scenario, i) => (
            <AnimateInView
              key={scenario.title}
              delay={i * 100}
              animation='fade-up'
              className='flex flex-col items-center text-center'
            >
              <div className='text-muted-foreground border-border/50 bg-muted/30 mb-3 flex size-12 items-center justify-center rounded-xl border'>
                <scenario.icon
                  aria-hidden='true'
                  className='size-5'
                  strokeWidth={1.5}
                />
              </div>
              <h3 className='mb-1.5 text-sm font-semibold'>{scenario.title}</h3>
              <p className='text-muted-foreground max-w-[200px] text-xs leading-relaxed'>
                {scenario.desc}
              </p>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
