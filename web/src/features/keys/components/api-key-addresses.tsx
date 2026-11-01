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

import { CopyButton } from '@/components/copy-button'
import { LoadingState } from '@/components/loading-state'
import { useApiInfo } from '@/features/dashboard/hooks/use-status-data'
import { useStatus } from '@/hooks/use-status'

export function ApiKeyAddresses() {
  const { t } = useTranslation()
  const { status, loading } = useStatus()
  const { items } = useApiInfo()
  const serverAddress =
    (typeof status?.server_address === 'string' &&
      status.server_address.trim()) ||
    ''
  const addresses = items.length
    ? items
    : [
        {
          url: serverAddress || window.location.origin,
          route: serverAddress ? t('Default API address') : t('Current domain'),
          description: '',
        },
      ]

  if (loading) {
    return <LoadingState inline size='sm' message={t('Loading...')} />
  }

  return (
    <ul
      aria-label={t('API Addresses')}
      className='flex max-h-48 min-w-0 shrink-0 flex-wrap gap-2 overflow-y-auto py-1'
    >
      {addresses.map((address) => (
        <li
          key={`${address.route}:${address.url}`}
          className='border-border bg-muted/30 flex max-w-full min-w-0 items-center gap-2 rounded-3xl border px-3 py-1.5 sm:gap-3 sm:px-4'
        >
          <div className='flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 text-sm'>
            <span className='text-muted-foreground break-words'>
              {address.route}
            </span>
            <code className='min-w-0 font-medium break-all select-text'>
              {address.url}
            </code>
            {address.description && (
              <span className='text-muted-foreground basis-full text-xs break-words'>
                {address.description}
              </span>
            )}
          </div>
          <CopyButton
            value={address.url}
            size='sm'
            className='size-7 rounded-full p-0'
            tooltip={t('Copy API URL')}
            aria-label={`${t('Copy API URL')}: ${address.url}`}
          />
        </li>
      ))}
    </ul>
  )
}
