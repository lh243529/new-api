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
import { Receipt, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { CopyButton } from '@/components/copy-button'
import {
  StaticDataTable,
  type StaticDataTableColumn,
} from '@/components/data-table'
import { Dialog } from '@/components/dialog'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useMediaQuery } from '@/hooks/use-media-query'
import { toIntlLocale } from '@/i18n/languages'
import { formatCurrencyFromUSD } from '@/lib/currency'
import { formatNumber } from '@/lib/format'

import { useBillingHistory } from '../../hooks/use-billing-history'
import {
  getStatusConfig,
  getPaymentMethodName,
  formatTimestamp,
} from '../../lib/billing'
import type { TopupRecord } from '../../types'

interface BillingHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BillingHistoryDialog(props: BillingHistoryDialogProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const history = useBillingHistory()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const pageSizes = [
    { value: '10', label: t('10 / page') },
    { value: '20', label: t('20 / page') },
    { value: '50', label: t('50 / page') },
    { value: '100', label: t('100 / page') },
  ]
  const [confirmTradeNo, setConfirmTradeNo] = useState<string | null>(null)
  const totalPages = Math.max(1, Math.ceil(history.total / history.pageSize))

  const handleConfirmComplete = async () => {
    if (!confirmTradeNo) return
    const success = await history.handleCompleteOrder(confirmTradeNo)
    if (success) setConfirmTradeNo(null)
  }

  const columns: StaticDataTableColumn<TopupRecord>[] = [
    {
      id: 'order',
      header: t('ID'),
      cell: (record) => (
        <div className='flex min-w-0 items-center gap-1'>
          <span
            className='max-w-48 truncate font-mono text-xs'
            title={record.trade_no}
          >
            {record.trade_no}
          </span>
          <CopyButton
            value={record.trade_no}
            aria-label={`${t('Copy')}: ${record.trade_no}`}
            className='size-8'
            iconClassName='size-3.5'
          />
        </div>
      ),
    },
    {
      id: 'method',
      header: t('Payment Method'),
      cell: (record) => getPaymentMethodName(record.payment_method, t),
    },
    {
      id: 'amount',
      header: t('Amount'),
      className: 'text-right',
      cellClassName: 'text-right font-medium tabular-nums',
      cell: (record) =>
        formatCurrencyFromUSD(record.amount, {
          digitsLarge: 2,
          digitsSmall: 2,
          abbreviate: false,
        }),
    },
    {
      id: 'money',
      header: t('Payment'),
      className: 'text-right',
      cellClassName: 'text-right font-semibold tabular-nums',
      cell: (record) => formatNumber(record.money, locale),
    },
    {
      id: 'time',
      header: t('Created At'),
      cellClassName: 'text-muted-foreground whitespace-nowrap text-xs',
      cell: (record) => formatTimestamp(record.create_time),
    },
    {
      id: 'status',
      header: t('Status'),
      cell: (record) => {
        const config = getStatusConfig(record.status)
        return (
          <StatusBadge
            variant={config.variant}
            copyable={false}
            label={t(config.label)}
          />
        )
      },
    },
  ]
  if (history.isAdmin) {
    columns.push({
      id: 'actions',
      header: t('Actions'),
      cell: (record) =>
        record.status === 'pending' ? (
          <Button
            size='sm'
            variant='outline'
            onClick={() => setConfirmTradeNo(record.trade_no)}
            disabled={history.completing}
          >
            {t('Complete Order')}
          </Button>
        ) : null,
    })
  }

  return (
    <>
      <Dialog
        open={props.open}
        onOpenChange={props.onOpenChange}
        title={t('Billing History')}
        description={t(
          'View your topup transaction records and payment history'
        )}
        contentClassName='max-h-(--dialog-available-height) overflow-hidden rounded-2xl sm:max-w-5xl'
        contentHeight='min(60dvh, 560px)'
        bodyClassName='flex h-full min-h-0 flex-col gap-4'
        footerClassName='border-t'
        footer={
          <div className='flex w-full flex-wrap items-center justify-between gap-3'>
            <p className='text-muted-foreground text-xs tabular-nums'>
              {t('Showing')}{' '}
              {formatNumber(
                history.total === 0
                  ? 0
                  : (history.page - 1) * history.pageSize + 1,
                locale
              )}
              {'\u2013'}
              {formatNumber(
                Math.min(history.page * history.pageSize, history.total),
                locale
              )}{' '}
              {t('of')} {formatNumber(history.total, locale)}
            </p>
            <Pagination className='mx-0 w-auto' aria-label={t('Page')}>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant='outline'
                    size='icon'
                    className='size-9'
                    aria-label={t('Go to previous page')}
                    onClick={() => history.handlePageChange(history.page - 1)}
                    disabled={history.loading || history.page <= 1}
                  >
                    <ChevronLeft className='size-4' />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <span
                    className='px-3 text-sm tabular-nums'
                    aria-live='polite'
                  >
                    {formatNumber(history.page, locale)} /{' '}
                    {formatNumber(totalPages, locale)}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant='outline'
                    size='icon'
                    className='size-9'
                    aria-label={t('Go to next page')}
                    onClick={() => history.handlePageChange(history.page + 1)}
                    disabled={history.loading || history.page >= totalPages}
                  >
                    <ChevronRight className='size-4' />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        }
      >
        <div className='flex shrink-0 items-center gap-2'>
          <div className='relative min-w-0 flex-1'>
            <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <Input
              aria-label={t('Search by order number...')}
              placeholder={t('Search by order number...')}
              value={history.keyword}
              onChange={(event) => history.handleSearch(event.target.value)}
              className='h-10 rounded-lg pl-9'
            />
          </div>
          <Select
            items={pageSizes}
            value={String(history.pageSize)}
            onValueChange={(value) =>
              value !== null &&
              history.handlePageSizeChange(Number.parseInt(value))
            }
          >
            <SelectTrigger
              className='h-10 w-28 shrink-0 rounded-lg sm:w-32'
              aria-label={t('Rows per page')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {pageSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div
          className='min-h-0 flex-1 overflow-auto overscroll-contain'
          aria-busy={history.loading}
        >
          {history.loading && (
            <div
              className='space-y-3'
              role='status'
              aria-label={t('Loading...')}
            >
              {[0, 1, 2, 3].map((key) => (
                <Skeleton key={key} className='h-20 w-full rounded-xl' />
              ))}
            </div>
          )}
          {!history.loading && history.records.length === 0 && (
            <EmptyState
              icon={Receipt}
              title={t('No billing records found')}
              description={
                history.keyword
                  ? t('Try adjusting your search')
                  : t('Your transaction history will appear here')
              }
            />
          )}
          {!history.loading && history.records.length > 0 && (
            <>
              {!isMobile && (
                <div>
                  <StaticDataTable
                    data={history.records}
                    columns={columns}
                    getRowKey={(record) => record.id}
                    tableClassName='min-w-[760px]'
                  />
                </div>
              )}
              {isMobile && (
                <div className='space-y-3'>
                  {history.records.map((record) => {
                    const config = getStatusConfig(record.status)
                    return (
                      <article
                        key={record.id}
                        className='space-y-4 rounded-xl border border-border/80 bg-card p-3.5'
                      >
                        <div className='flex items-start justify-between gap-2'>
                          <div className='min-w-0'>
                            <div className='flex min-w-0 items-center gap-1'>
                              <span
                                className='truncate font-mono text-xs'
                                title={record.trade_no}
                              >
                                {record.trade_no}
                              </span>
                              <CopyButton
                                value={record.trade_no}
                                aria-label={`${t('Copy')}: ${record.trade_no}`}
                                className='size-8'
                                iconClassName='size-3.5'
                              />
                            </div>
                            <p className='text-muted-foreground text-xs'>
                              {formatTimestamp(record.create_time)}
                            </p>
                          </div>
                          <StatusBadge
                            variant={config.variant}
                            label={t(config.label)}
                            copyable={false}
                          />
                        </div>
                        <dl className='grid grid-cols-2 gap-3 text-xs'>
                          <div>
                            <dt className='text-muted-foreground'>
                              {t('Amount')}
                            </dt>
                            <dd className='mt-1 font-semibold tabular-nums [overflow-wrap:anywhere]'>
                              {formatCurrencyFromUSD(record.amount, {
                                digitsLarge: 2,
                                digitsSmall: 2,
                                abbreviate: false,
                              })}
                            </dd>
                          </div>
                          <div>
                            <dt className='text-muted-foreground'>
                              {t('Payment')}
                            </dt>
                            <dd className='mt-1 font-semibold tabular-nums [overflow-wrap:anywhere]'>
                              {formatNumber(record.money, locale)}
                            </dd>
                          </div>
                          <div className='col-span-2 flex items-center justify-between gap-2'>
                            <dt className='text-muted-foreground'>
                              {t('Payment Method')}
                            </dt>
                            <dd>
                              {getPaymentMethodName(record.payment_method, t)}
                            </dd>
                          </div>
                        </dl>
                        {history.isAdmin && record.status === 'pending' && (
                          <Button
                            size='sm'
                            variant='outline'
                            className='w-full'
                            onClick={() => setConfirmTradeNo(record.trade_no)}
                            disabled={history.completing}
                          >
                            {t('Complete Order')}
                          </Button>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </Dialog>
      <ConfirmDialog
        open={!!confirmTradeNo}
        onOpenChange={(open) => {
          if (!open && !history.completing) setConfirmTradeNo(null)
        }}
        title={t('Complete Order')}
        desc={t(
          'Are you sure you want to manually complete this order? The user will be credited with the corresponding quota.'
        )}
        confirmText={t('Confirm')}
        handleConfirm={handleConfirmComplete}
        isLoading={history.completing}
      />
    </>
  )
}
