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
import { act, render, screen } from '@testing-library/react'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { beforeEach, expect, it, vi } from 'vitest'

import { BillingHistoryDialog } from '@/features/wallet/components/dialogs/billing-history-dialog'
import en from '@/i18n/locales/en.json'
import zh from '@/i18n/locales/zh.json'
import { api } from '@/lib/api'

import { RechargeFormCard } from '../components/recharge-form-card'
import { TopupLinkFrame } from '../components/topup-link-frame'

const i18n = createInstance()

beforeEach(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'zh',
    fallbackLng: false,
    nsSeparator: false,
    resources: { en, zh },
    interpolation: { escapeValue: false },
  })
})

it('translates billing history statuses and updates them when the language changes', async () => {
  vi.spyOn(api, 'get').mockResolvedValue({
    data: {
      success: true,
      data: {
        total: 3,
        items: ['success', 'pending', 'expired'].map((status, id) => ({
          id,
          status,
          amount: 10,
          money: 10,
          trade_no: `order-${id}`,
          payment_method: 'stripe',
          create_time: 1,
        })),
      },
    },
  })
  render(
    <I18nextProvider i18n={i18n}>
      <BillingHistoryDialog open onOpenChange={vi.fn()} />
    </I18nextProvider>
  )
  await screen.findByText('order-0')
  for (const label of ['成功', '待确认', '已过期']) {
    expect(screen.getByText(label)).toBeVisible()
  }
  await act(() => i18n.changeLanguage('en'))
  for (const label of ['Success', 'Pending', 'Expired']) {
    expect(screen.getByText(label)).toBeVisible()
  }
})

it.each([
  { priceRatio: 7.3, paid: '584', saved: '146', full: '146' },
  { priceRatio: 0.000123, paid: '0.0098', saved: '0.0025', full: '0.0025' },
])(
  'translates recharge presets and minimum amount without changing precision at price ratio $priceRatio',
  async ({ priceRatio, paid, saved, full }) => {
    render(
      <I18nextProvider i18n={i18n}>
        <RechargeFormCard
          topupInfo={{
            enable_online_topup: true,
            enable_stripe_topup: false,
            pay_methods: [],
            min_topup: 1,
            stripe_min_topup: 1,
            amount_options: [100, 20],
            discount: {},
          }}
          presetAmounts={[{ value: 100, discount: 0.8 }, { value: 20 }]}
          selectedPreset={null}
          topupAmount={1}
          paymentAmount={priceRatio}
          priceRatio={priceRatio}
          calculating={false}
          paymentLoading={null}
          redemptionCode=''
          redeeming={false}
          onSelectPreset={vi.fn()}
          onTopupAmountChange={vi.fn()}
          onPaymentMethodSelect={vi.fn()}
          onRedemptionCodeChange={vi.fn()}
          onRedeem={vi.fn()}
        />
      </I18nextProvider>
    )
    expect(screen.getByRole('button', { name: /^100 / })).toHaveTextContent(
      `优惠 20%支付 ${paid} • 节省 ${saved}`
    )
    expect(screen.getByRole('button', { name: /^20 / })).toHaveTextContent(
      `支付 ${full}`
    )
    expect(screen.getByPlaceholderText('最低 1')).toBeVisible()
    await act(() => i18n.changeLanguage('en'))
    expect(screen.getByRole('button', { name: /^100 / })).toHaveTextContent(
      `20% OFFPay ${paid} • Save ${saved}`
    )
    expect(screen.getByRole('button', { name: /^20 / })).toHaveTextContent(
      `Pay ${full}`
    )
    expect(screen.getByPlaceholderText('Minimum 1')).toBeVisible()
  }
)

it.each([
  undefined,
  '',
  '   ',
  'not a link',
  'example.com/topup',
  '/topup',
  '//shop.example.test/topup',
  'https://',
  'javascript:alert(1)',
  'data:text/html,<h1>topup</h1>',
  'ftp://shop.example.test/topup',
])('does not reserve space for an invalid top-up link: %s', (topupLink) => {
  const { container } = render(
    <I18nextProvider i18n={i18n}>
      <TopupLinkFrame topupLink={topupLink} />
    </I18nextProvider>
  )
  expect(container).toBeEmptyDOMElement()
})

it.each(['https://shop.example.test/topup', 'http://shop.example.test/topup'])(
  'embeds a valid shop with the fixed height and payment capabilities: %s',
  (source) => {
    render(
      <I18nextProvider i18n={i18n}>
        <TopupLinkFrame topupLink={`  ${source}  `} />
      </I18nextProvider>
    )
    const iframe = screen.getByTitle('充值链接')
    expect(iframe).toHaveAttribute('src', source)
    expect(iframe).toHaveAttribute('height', '700')
    expect(iframe).toHaveClass('h-[700px]', 'w-full', 'shrink-0')
    const permissions = iframe.getAttribute('sandbox')?.split(' ')
    expect(permissions).toEqual(
      expect.arrayContaining([
        'allow-forms',
        'allow-scripts',
        'allow-popups',
        'allow-popups-to-escape-sandbox',
        'allow-top-navigation-by-user-activation',
        'allow-same-origin',
      ])
    )
    expect(permissions).not.toContain('allow-top-navigation')
  }
)

it('isolates same-origin embeds and replaces or removes the iframe as configuration changes', async () => {
  const { rerender } = render(
    <I18nextProvider i18n={i18n}>
      <TopupLinkFrame topupLink='https://shop.example.test/first' />
    </I18nextProvider>
  )
  const previous = screen.getByTitle('充值链接')
  const localUrl = new URL('/topup', window.location.href).href
  rerender(
    <I18nextProvider i18n={i18n}>
      <TopupLinkFrame topupLink={localUrl} />
    </I18nextProvider>
  )
  const current = screen.getByTitle('充值链接')
  expect(current).not.toBe(previous)
  expect(previous).not.toBeInTheDocument()
  expect(current).toHaveAttribute('src', localUrl)
  expect(current.getAttribute('sandbox')?.split(' ')).not.toContain(
    'allow-same-origin'
  )
  await act(() => i18n.changeLanguage('en'))
  expect(screen.getByTitle('Top-Up Link')).toBe(current)
  rerender(
    <I18nextProvider i18n={i18n}>
      <TopupLinkFrame topupLink='' />
    </I18nextProvider>
  )
  expect(current).not.toBeInTheDocument()
  expect(screen.queryByTitle('Top-Up Link')).toBeNull()
  rerender(
    <I18nextProvider i18n={i18n}>
      <TopupLinkFrame topupLink='invalid' />
    </I18nextProvider>
  )
  expect(screen.queryByTitle('Top-Up Link')).toBeNull()
})
