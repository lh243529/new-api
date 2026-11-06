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
import { Share2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { TitledCard } from '@/components/ui/titled-card'
import { toIntlLocale } from '@/i18n/languages'
import { formatNumber, formatQuota } from '@/lib/format'

import type { UserWalletData } from '../types'

interface AffiliateRewardsCardProps {
  user: UserWalletData | null
  affiliateLink: string
  onTransfer: () => void
  complianceConfirmed?: boolean
  loading?: boolean
}

export function AffiliateRewardsCard({
  user,
  affiliateLink,
  onTransfer,
  complianceConfirmed = true,
  loading,
}: AffiliateRewardsCardProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  if (loading) {
    return (
      <Card
        data-card-hover='false'
        className='min-w-0 rounded-2xl border-border/80 py-0 shadow-sm'
      >
        <CardContent className='space-y-4 p-3 sm:p-5'>
          <div>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='mt-2 h-4 w-48' />
          </div>
          <Skeleton className='h-14 rounded-lg' />
          <Skeleton className='h-10 rounded-lg' />
        </CardContent>
      </Card>
    )
  }

  const hasRewards = (user?.aff_quota ?? 0) > 0

  return (
    <TitledCard
      title={t('Referral Program')}
      description={t(
        'Earn rewards when users join through your referral link. Transfer accumulated rewards to your balance anytime.'
      )}
      icon={<Share2 />}
      iconTone='chart-3'
      disableHoverEffect
      className='min-w-0 rounded-2xl border-border/80 shadow-sm'
      titleClassName='text-base sm:text-base'
      descriptionClassName='text-xs leading-relaxed sm:text-xs'
      contentClassName='space-y-4'
    >
      <div className='grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/30 p-2.5 text-center'>
        {[
          [t('Pending'), formatQuota(user?.aff_quota ?? 0)],
          [t('Total Earned'), formatQuota(user?.aff_history_quota ?? 0)],
          [t('Invites'), formatNumber(user?.aff_count ?? 0, locale)],
        ].map(([label, value]) => (
          <div key={label}>
            <div className='text-muted-foreground text-[10px] leading-relaxed font-medium [overflow-wrap:anywhere]'>
              {label}
            </div>
            <div className='mt-1 text-xs font-semibold tabular-nums [overflow-wrap:anywhere] sm:text-sm'>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className='flex items-center gap-2'>
        <Input
          value={affiliateLink}
          readOnly
          aria-label={t('Your Referral Link')}
          className='bg-muted/30 h-10 min-w-0 flex-1 rounded-lg font-mono text-xs'
        />
        <CopyButton
          value={affiliateLink}
          variant='outline'
          className='bg-background size-10 shrink-0'
          iconClassName='size-4'
          tooltip={t('Copy referral link')}
          aria-label={t('Copy referral link')}
        />
      </div>
      {hasRewards && (
        <Button
          onClick={onTransfer}
          disabled={!complianceConfirmed}
          className='h-auto min-h-10 w-full rounded-lg px-3 py-2 whitespace-normal'
          size='sm'
        >
          {t('Transfer to Balance')}
        </Button>
      )}
      {!complianceConfirmed ? (
        <p className='text-muted-foreground text-xs leading-relaxed'>
          {t(
            'Referral reward transfer is disabled until the administrator confirms compliance terms.'
          )}
        </p>
      ) : null}
    </TitledCard>
  )
}
