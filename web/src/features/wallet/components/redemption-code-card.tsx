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
import { ExternalLink, Gift, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { TitledCard } from '@/components/ui/titled-card'

interface RedemptionCodeCardProps {
  code: string
  onCodeChange: (code: string) => void
  onRedeem: () => void
  redeeming: boolean
  enabled: boolean
  topupLink?: string
  loading?: boolean
}

export function RedemptionCodeCard(props: RedemptionCodeCardProps) {
  const { t } = useTranslation()

  return (
    <TitledCard
      title={t('Redemption Code')}
      icon={<Gift />}
      iconTone='warning'
      disableHoverEffect
      className='min-w-0 rounded-2xl border-border/80 shadow-sm'
      titleClassName='text-base sm:text-base'
      contentClassName='space-y-3'
    >
      {props.loading && (
        <div className='space-y-3' aria-busy='true'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </div>
      )}
      {!props.loading && !props.enabled && (
        <Alert>
          <AlertDescription>
            {t(
              'Redemption codes are disabled until the administrator confirms compliance terms.'
            )}
          </AlertDescription>
        </Alert>
      )}
      {!props.loading && props.enabled && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (!props.redeeming) props.onRedeem()
          }}
          className='space-y-3'
        >
          <Label htmlFor='redemption-code'>{t('Have a Code?')}</Label>
          <Input
            id='redemption-code'
            value={props.code}
            onChange={(event) => props.onCodeChange(event.target.value)}
            placeholder={t('Enter your redemption code')}
            disabled={props.redeeming}
            className='h-10 min-w-0 rounded-lg'
          />
          <Button
            type='submit'
            disabled={props.redeeming}
            variant='secondary'
            className='h-10 w-full rounded-lg'
          >
            {props.redeeming && <Loader2 className='size-4 animate-spin' />}
            {t('Redeem')}
          </Button>
          {props.topupLink && (
            <p className='text-muted-foreground text-xs leading-relaxed'>
              {t('Need a redemption code?')}{' '}
              <a
                href={props.topupLink}
                target='_blank'
                rel='noopener noreferrer'
                className='text-foreground inline-flex items-center gap-1 underline-offset-4 hover:underline'
              >
                {t('Get one here')}
                <ExternalLink className='size-3' />
              </a>
            </p>
          )}
        </form>
      )}
    </TitledCard>
  )
}
