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
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { HOME_PROVIDERS } from '../../constants'

export function Stats() {
  const { t } = useTranslation()

  return (
    <section
      aria-labelledby='home-providers-title'
      className='border-border/40 bg-muted/10 relative z-10 border-y'
    >
      <div className='mx-auto max-w-6xl px-6 py-10 text-center md:py-12'>
        <h2
          id='home-providers-title'
          className='text-lg font-semibold tracking-tight md:text-xl'
        >
          {t('Five model providers. One gateway.')}
        </h2>
        <ul className='mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-5 md:gap-x-14'>
          {HOME_PROVIDERS.map((provider) => (
            <li
              key={provider.name}
              className='flex items-center gap-2.5 text-sm font-semibold md:text-base'
            >
              <img
                src={provider.icon}
                alt=''
                width={28}
                height={28}
                loading='lazy'
                className={cn(
                  'size-7 shrink-0',
                  provider.monochrome && 'dark:invert'
                )}
              />
              {provider.name}
            </li>
          ))}
        </ul>
        <p className='text-muted-foreground mx-auto mt-6 max-w-2xl text-xs leading-relaxed md:text-sm'>
          {t(
            'Choose models for your tools and apps. Check the model catalog for current availability and pricing.'
          )}
        </p>
      </div>
    </section>
  )
}
