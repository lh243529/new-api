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
import { Activity, BarChart3, WalletCards } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { StaggerContainer, StaggerItem } from '@/components/page-transition'
import { IconBadge, type IconBadgeTone } from '@/components/ui/icon-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toIntlLocale } from '@/i18n/languages'
import { formatNumber, formatQuota } from '@/lib/format'
import { cn } from '@/lib/utils'

import type { UserWalletData } from '../types'

interface WalletStatsCardProps {
  user: UserWalletData | null
  loading?: boolean
}

export function WalletStatsCard(props: WalletStatsCardProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  if (props.loading) {
    return (
      <div className='grid grid-cols-3 gap-2 sm:gap-4'>
        {['balance', 'usage', 'requests'].map((key) => (
          <div
            key={key}
            className='min-w-0 rounded-2xl border border-border/80 bg-card p-3 sm:p-5'
          >
            <Skeleton className='h-3.5 w-full' />
            <Skeleton className='mt-2 h-6 w-full sm:h-7' />
            <Skeleton className='mt-1.5 hidden h-3.5 w-24 md:block' />
          </div>
        ))}
      </div>
    )
  }

  const stats: {
    label: string
    value: string
    description: string
    icon: typeof WalletCards
    tone: IconBadgeTone
  }[] = [
    {
      label: t('Current Balance'),
      value: formatQuota(props.user?.quota ?? 0),
      description: t('Remaining quota'),
      icon: WalletCards,
      tone: 'success',
    },
    {
      label: t('Total Usage'),
      value: formatQuota(props.user?.used_quota ?? 0),
      description: t('Total consumed quota'),
      icon: BarChart3,
      tone: 'info',
    },
    {
      label: t('API Requests'),
      value: formatNumber(props.user?.request_count ?? 0, locale),
      description: t('Total requests made'),
      icon: Activity,
      tone: 'chart-4',
    },
  ]

  return (
    <StaggerContainer className='grid grid-cols-3 gap-2 sm:gap-4'>
      {stats.map((item) => (
        <StaggerItem key={item.label} className='min-w-0'>
          <div
            className={cn(
              'relative h-full min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card p-3 shadow-sm motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5',
              item.tone === 'success' &&
                'border-primary/20 bg-linear-to-br from-primary/10 via-card to-card'
            )}
          >
            <div className='flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-2.5'>
              <IconBadge tone={item.tone} size='stat'>
                <item.icon />
              </IconBadge>
              <div className='text-muted-foreground text-[11px] leading-relaxed font-medium [overflow-wrap:anywhere] sm:text-xs'>
                {item.label}
              </div>
            </div>

            <div className='text-foreground mt-1.5 text-base font-semibold tracking-tight tabular-nums [overflow-wrap:anywhere] sm:mt-3 sm:text-3xl'>
              {item.value}
            </div>
            <div className='text-muted-foreground mt-1 hidden text-xs md:block'>
              {item.description}
            </div>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
