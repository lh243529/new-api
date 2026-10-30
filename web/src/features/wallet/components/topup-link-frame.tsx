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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { isHttpUrl } from '@/lib/content-format'

interface TopupLinkFrameProps {
  topupLink?: string
}

export function TopupLinkFrame(props: TopupLinkFrameProps) {
  const { t } = useTranslation()
  const [reloadCount, setReloadCount] = useState(0)
  const source = props.topupLink?.trim()
  if (!source || !isHttpUrl(source)) return null

  const sandbox = [
    'allow-forms',
    'allow-scripts',
    'allow-popups',
    'allow-popups-to-escape-sandbox',
    'allow-top-navigation-by-user-activation',
  ]
  // Third-party shops need their own origin for storage and API requests.
  // Never combine scripts and same-origin access for a page on our own origin.
  if (new URL(source).origin !== window.location.origin) {
    sandbox.push('allow-same-origin')
  }

  return (
    <section className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-center gap-3'>
        <h3 className='text-base font-semibold'>{t('Get Redemption Code')}</h3>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => setReloadCount((count) => count + 1)}
        >
          {t('Back to purchase page')}
        </Button>
      </div>
      <iframe
        key={`${source}:${reloadCount}`}
        src={source}
        title={t('Top-Up Link')}
        height={700}
        className='bg-background block h-[700px] w-full shrink-0 rounded-xl border'
        sandbox={sandbox.join(' ')}
      />
    </section>
  )
}
