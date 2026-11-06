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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { Wallet } from '@/features/wallet'
import { BillingHistoryDialog } from '@/features/wallet/components/dialogs/billing-history-dialog'
import en from '@/i18n/locales/en.json'
import zh from '@/i18n/locales/zh.json'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

import { AffiliateRewardsCard } from '../components/affiliate-rewards-card'
import { RechargeFormCard } from '../components/recharge-form-card'
import { RedemptionCodeCard } from '../components/redemption-code-card'
import { TopupLinkFrame } from '../components/topup-link-frame'
import { WalletStatsCard } from '../components/wallet-stats-card'
import type { UserWalletData, TopupInfo } from '../types'

const i18n = createInstance()

beforeEach(async () => {
  useAuthStore.getState().auth.setUser(null)
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

          onSelectPreset={vi.fn()}
          onTopupAmountChange={vi.fn()}
          onPaymentMethodSelect={vi.fn()}
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
    expect(screen.getByRole('button', { name: '回到购买页' })).toHaveAttribute(
      'type',
      'button'
    )
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

it('returns the embed to the configured purchase page on every click without navigating the wallet', async () => {
  const user = userEvent.setup()
  const source = 'https://shop.example.test/topup'
  render(
    <I18nextProvider i18n={i18n}>
      <TopupLinkFrame topupLink={`  ${source}  `} />
    </I18nextProvider>
  )
  const walletUrl = window.location.href
  const button = screen.getByRole('button', { name: '回到购买页' })
  let previous = screen.getByTitle('充值链接')
  const permissions = previous.getAttribute('sandbox')

  for (let click = 0; click < 2; click++) {
    await user.click(button)
    const current = screen.getByTitle('充值链接')
    expect(previous).not.toBeInTheDocument()
    expect(current).toHaveAttribute('src', source)
    expect(current).toHaveAttribute('height', '700')
    expect(current).toHaveAttribute('sandbox', permissions)
    expect(button).toHaveFocus()
    expect(window.location.href).toBe(walletUrl)
    previous = current
  }
})

it('supports returning to the purchase page with the keyboard and translates the button without reloading the embed', async () => {
  const user = userEvent.setup()
  render(
    <I18nextProvider i18n={i18n}>
      <TopupLinkFrame topupLink='https://shop.example.test/topup' />
    </I18nextProvider>
  )
  const button = screen.getByRole('button', { name: '回到购买页' })
  await user.tab()
  expect(button).toHaveFocus()
  for (const key of ['{Enter}', ' ']) {
    const previous = screen.getByTitle('充值链接')
    await user.keyboard(key)
    expect(previous).not.toBeInTheDocument()
    expect(screen.getByTitle('充值链接')).toHaveAttribute(
      'src',
      'https://shop.example.test/topup'
    )
  }
  const current = screen.getByTitle('充值链接')
  await act(() => i18n.changeLanguage('en'))
  expect(screen.getByRole('button', { name: 'Back to purchase page' })).toBe(
    button
  )
  expect(screen.getByTitle('Top-Up Link')).toBe(current)
})

it('isolates same-origin embeds and replaces or removes the iframe as configuration changes', async () => {
  const user = userEvent.setup()
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
  await user.click(screen.getByRole('button', { name: '回到购买页' }))
  const restored = screen.getByTitle('充值链接')
  expect(current).not.toBeInTheDocument()
  expect(restored).toHaveAttribute('src', localUrl)
  expect(restored.getAttribute('sandbox')?.split(' ')).not.toContain(
    'allow-same-origin'
  )
  await act(() => i18n.changeLanguage('en'))
  expect(screen.getByTitle('Top-Up Link')).toBe(restored)
  rerender(
    <I18nextProvider i18n={i18n}>
      <TopupLinkFrame topupLink='' />
    </I18nextProvider>
  )
  expect(restored).not.toBeInTheDocument()
  expect(screen.queryByTitle('Top-Up Link')).toBeNull()
  expect(
    screen.queryByRole('button', { name: 'Back to purchase page' })
  ).not.toBeInTheDocument()
  rerender(
    <I18nextProvider i18n={i18n}>
      <TopupLinkFrame topupLink='invalid' />
    </I18nextProvider>
  )
  expect(screen.queryByTitle('Top-Up Link')).toBeNull()
})

const walletUser: UserWalletData = {
  id: 1,
  username: 'wallet-user',
  group: 'default',
  quota: 125000000,
  used_quota: 24000000,
  request_count: 1234567,
  aff_quota: 500000,
  aff_history_quota: 1000000,
  aff_count: 12,
}
const onlineTopup: TopupInfo = {
  enable_online_topup: true,
  enable_stripe_topup: false,
  pay_methods: [{ type: 'alipay', name: 'Alipay', min_topup: 1 }],
  min_topup: 1,
  stripe_min_topup: 1,
  amount_options: [10, 20, 50, 100],
  discount: {},
}

afterEach(() => {
  useAuthStore.getState().auth.setUser(null)
})

it('submits a redemption by keyboard and prevents submissions when disabled or processing', async () => {
  await i18n.changeLanguage('en')
  const user = userEvent.setup()
  const onCodeChange = vi.fn()
  const onRedeem = vi.fn()
  const props = {
    code: 'TEST-CODE',
    onCodeChange,
    onRedeem,
    redeeming: false,
    enabled: true,
  }
  const view = render(
    <I18nextProvider i18n={i18n}>
      <RedemptionCodeCard {...props} />
    </I18nextProvider>
  )
  const input = screen.getByRole('textbox', { name: 'Have a Code?' })
  await user.type(input, 'X')
  expect(onCodeChange).toHaveBeenLastCalledWith('TEST-CODEX')
  await user.click(input)
  await user.keyboard('{Enter}')
  expect(onRedeem).toHaveBeenCalledOnce()
  view.rerender(
    <I18nextProvider i18n={i18n}>
      <RedemptionCodeCard {...props} redeeming />
    </I18nextProvider>
  )
  expect(input).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Redeem' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Redeem' }))
  expect(onRedeem).toHaveBeenCalledOnce()
  view.rerender(
    <I18nextProvider i18n={i18n}>
      <RedemptionCodeCard {...props} enabled={false} />
    </I18nextProvider>
  )
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  expect(
    screen.getByText(
      'Redemption codes are disabled until the administrator confirms compliance terms.'
    )
  ).toBeVisible()
})

it('keeps preset selection and payment dispatch available and blocks duplicate processing clicks', async () => {
  await i18n.changeLanguage('en')
  const user = userEvent.setup()
  const onSelectPreset = vi.fn()
  const onPaymentMethodSelect = vi.fn()
  const props = {
    topupInfo: onlineTopup,
    presetAmounts: [
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ],
    selectedPreset: 20,
    topupAmount: 20,
    onTopupAmountChange: vi.fn(),
    paymentAmount: 20,
    calculating: false,
    paymentLoading: null,
    onSelectPreset,
    onPaymentMethodSelect,
  }
  const view = render(
    <I18nextProvider i18n={i18n}>
      <RechargeFormCard {...props} />
    </I18nextProvider>
  )
  const selected = screen.getByRole('button', { name: /^20 / })
  expect(selected).toHaveAttribute('aria-pressed', 'true')
  const preset = screen.getByRole('button', { name: /^50 / })
  expect(preset).toHaveAttribute('aria-pressed', 'false')
  await user.click(preset)
  expect(onSelectPreset).toHaveBeenCalledWith({ value: 50 })
  await user.click(screen.getByRole('button', { name: 'Alipay' }))
  expect(onPaymentMethodSelect).toHaveBeenCalledWith(onlineTopup.pay_methods[0])
  view.rerender(
    <I18nextProvider i18n={i18n}>
      <RechargeFormCard {...props} paymentLoading='alipay' />
    </I18nextProvider>
  )
  expect(screen.getByRole('button', { name: 'Alipay' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Alipay' }))
  expect(onPaymentMethodSelect).toHaveBeenCalledOnce()
})

it('copies the referral link and keeps reward transfer subject to compliance and balance', async () => {
  await i18n.changeLanguage('en')
  const user = userEvent.setup()
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue()
  const onTransfer = vi.fn()
  const props = {
    user: walletUser,
    affiliateLink: 'https://example.test/register?aff=demo',
    onTransfer,
  }
  const view = render(
    <I18nextProvider i18n={i18n}>
      <AffiliateRewardsCard {...props} />
    </I18nextProvider>
  )
  expect(
    screen.getByRole('textbox', { name: 'Your Referral Link' })
  ).toHaveAttribute('readonly')
  await user.click(screen.getByRole('button', { name: 'Copy referral link' }))
  expect(writeText).toHaveBeenCalledWith(props.affiliateLink)
  await user.click(screen.getByRole('button', { name: 'Transfer to Balance' }))
  expect(onTransfer).toHaveBeenCalledOnce()
  view.rerender(
    <I18nextProvider i18n={i18n}>
      <AffiliateRewardsCard {...props} complianceConfirmed={false} />
    </I18nextProvider>
  )
  expect(
    screen.getByRole('button', { name: 'Transfer to Balance' })
  ).toBeDisabled()
  view.rerender(
    <I18nextProvider i18n={i18n}>
      <AffiliateRewardsCard {...props} user={{ ...walletUser, aff_quota: 0 }} />
    </I18nextProvider>
  )
  expect(
    screen.queryByRole('button', { name: 'Transfer to Balance' })
  ).not.toBeInTheDocument()
})

it('updates request-count formatting when the interface language changes', async () => {
  await i18n.changeLanguage('en')
  render(
    <I18nextProvider i18n={i18n}>
      <WalletStatsCard user={walletUser} />
    </I18nextProvider>
  )
  expect(screen.getByText('1,234,567')).toBeVisible()
  for (const [language, expected] of [
    ['fr', '1 234 567'],
    ['zhCN', '1,234,567'],
    ['zhTW', '1,234,567'],
    ['en', '1,234,567'],
    ['ja', '1,234,567'],
    ['ru', '1 234 567'],
    ['vi', '1.234.567'],
    ['not_a_locale', '1,234,567'],
  ]) {
    await act(() => i18n.changeLanguage(language))
    expect(screen.getByText(expected)).toBeVisible()
  }
})

it.each([false, true])(
  'searches and paginates history, copies full order IDs and preserves the responsive view (mobile=%s)',
  async (mobile) => {
    await i18n.changeLanguage('en')
    const matchMedia = window.matchMedia.bind(window)
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      ...matchMedia(query),
      matches:
        query === '(max-width: 767px)' ? mobile : matchMedia(query).matches,
    }))
    const user = userEvent.setup()
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue()
    const order = 'order-20261106-with-a-very-long-reference-123456789'
    const get = vi.spyOn(api, 'get').mockImplementation(async (url) => {
      const params = new URL(String(url), 'https://example.test').searchParams
      const page = params.get('p')
      return {
        data: {
          success: true,
          data: {
            total: 25,
            items: [
              {
                id: 1,
                trade_no: params.has('keyword')
                  ? 'search-result'
                  : `${order}-${page}`,
                amount: 10,
                money: 12.5,
                status: 'success',
                payment_method: 'stripe',
                create_time: 1,
              },
            ],
          },
        },
      }
    })
    render(
      <I18nextProvider i18n={i18n}>
        <BillingHistoryDialog open onOpenChange={vi.fn()} />
      </I18nextProvider>
    )
    await screen.findByText(`${order}-1`)
    expect(screen.queryByRole('table') !== null).toBe(!mobile)
    expect(
      screen.queryByRole('button', { name: 'Complete Order' })
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: `Copy: ${order}-1` }))
    expect(writeText).toHaveBeenCalledWith(`${order}-1`)
    await user.click(screen.getByRole('button', { name: 'Go to next page' }))
    await screen.findByText(`${order}-2`)
    await user.type(
      screen.getByRole('textbox', { name: 'Search by order number...' }),
      'search'
    )
    await screen.findByText('search-result')
    const lastURL = String(get.mock.calls.at(-1)?.[0])
    expect(lastURL).toContain('p=1')
    expect(lastURL).toContain('keyword=search')
    expect(
      screen.getByRole('button', { name: 'Go to previous page' })
    ).toBeDisabled()
    await user.click(screen.getByRole('combobox', { name: 'Rows per page' }))
    await user.click(screen.getByRole('option', { name: '20 / page' }))
    await waitFor(() =>
      expect(String(get.mock.calls.at(-1)?.[0])).toContain('page_size=20')
    )
  }
)

it.each([true, false])(
  'confirms pending admin orders and retains the confirmation after a failed completion (success=%s)',
  async (success) => {
    await i18n.changeLanguage('en')
    useAuthStore.getState().auth.setUser({ ...walletUser, role: 10 })
    const user = userEvent.setup()
    const post = vi.spyOn(api, 'post').mockResolvedValue({
      data: { success, message: success ? '' : 'Failed to complete order' },
    })
    vi.spyOn(api, 'get').mockResolvedValue({
      data: {
        success: true,
        data: {
          total: 1,
          items: [
            {
              id: 1,
              trade_no: 'pending-order',
              amount: 10,
              money: 10,
              status: 'pending',
              payment_method: 'stripe',
              create_time: 1,
            },
          ],
        },
      },
    })
    render(
      <I18nextProvider i18n={i18n}>
        <BillingHistoryDialog open onOpenChange={vi.fn()} />
      </I18nextProvider>
    )
    await user.click(
      await screen.findByRole('button', { name: 'Complete Order' })
    )
    const confirmation = screen.getByRole('alertdialog')
    await user.click(
      within(confirmation).getByRole('button', { name: 'Confirm' })
    )
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/api/user/topup/complete', {
        trade_no: 'pending-order',
      })
    )
    if (success) {
      await waitFor(() =>
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      )
    } else {
      expect(screen.getByRole('alertdialog')).toBeVisible()
    }
  }
)

it('refreshes the wallet balance and clears the standalone redemption form only after successful redemption', async () => {
  await i18n.changeLanguage('en')
  const user = userEvent.setup()
  let redeemed = false
  let shouldSucceed = false
  const get = vi.spyOn(api, 'get').mockImplementation(async (url) => {
    let data: unknown = null
    switch (url) {
      case '/api/user/self':
        data = { ...walletUser, quota: redeemed ? 150000000 : 125000000 }
        break
      case '/api/user/topup/info':
        data = { ...onlineTopup, enable_redemption: true }
        break
      case '/api/user/aff':
        data = 'demo'
        break
      case '/api/subscription/plans':
        data = []
        break
      case '/api/subscription/self':
        data = {
          billing_preference: 'wallet_first',
          subscriptions: [],
          all_subscriptions: [],
        }
        break
      case '/api/status':
        data = { price: 1 }
        break
      default:
        data = { items: [], total: 0 }
    }
    return { data: { success: true, data } }
  })
  const post = vi.spyOn(api, 'post').mockImplementation(async (url) => {
    if (url !== '/api/user/topup') {
      return { data: { success: true, data: '10' } }
    }
    redeemed = shouldSucceed
    return {
      data: {
        success: shouldSucceed,
        data: shouldSucceed ? 25000000 : null,
        message: shouldSucceed ? '' : 'Redemption failed',
      },
    }
  })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <Wallet />
      </I18nextProvider>
    </QueryClientProvider>
  )
  const input = await screen.findByRole('textbox', { name: 'Have a Code?' })
  await screen.findByText('$250')
  await user.type(input, 'DEMO-CODE')
  await user.click(screen.getByRole('button', { name: 'Redeem' }))
  await waitFor(() =>
    expect(post).toHaveBeenCalledWith('/api/user/topup', { key: 'DEMO-CODE' })
  )
  expect(input).toHaveValue('DEMO-CODE')
  expect(screen.getByText('$250')).toBeVisible()
  shouldSucceed = true
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Redeem' })).toBeEnabled()
  )
  await user.click(screen.getByRole('button', { name: 'Redeem' }))
  await screen.findByText('$300')
  expect(input).toHaveValue('')
  expect(
    get.mock.calls.filter(([url]) => url === '/api/user/self').length
  ).toBeGreaterThan(1)
  await user.click(screen.getByRole('button', { name: 'Order History' }))
  expect(
    await screen.findByRole('dialog', { name: 'Billing History' })
  ).toBeVisible()
  await user.keyboard('{Escape}')
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  )
  expect(screen.getByRole('button', { name: 'Order History' })).toHaveFocus()
  view.unmount()
  queryClient.clear()
})

it('distinguishes loading, empty history and an empty search result without enabling pagination', async () => {
  await i18n.changeLanguage('en')
  const user = userEvent.setup()
  let finishLoad:
    | ((response: {
        data: { success: boolean; data: { total: number; items: never[] } }
      }) => void)
    | undefined
  const get = vi
    .spyOn(api, 'get')
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishLoad = resolve
        })
    )
    .mockResolvedValue({
      data: { success: true, data: { total: 0, items: [] } },
    })
  render(
    <I18nextProvider i18n={i18n}>
      <BillingHistoryDialog open onOpenChange={vi.fn()} />
    </I18nextProvider>
  )
  expect(screen.getByRole('status', { name: 'Loading...' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled()
  await act(async () => {
    finishLoad?.({ data: { success: true, data: { total: 0, items: [] } } })
  })
  expect(
    await screen.findByText('Your transaction history will appear here')
  ).toBeVisible()
  expect(screen.getByText(/Showing 0.*0 of 0/)).toBeVisible()
  await user.type(
    screen.getByRole('textbox', { name: 'Search by order number...' }),
    'missing-order'
  )
  await waitFor(() =>
    expect(String(get.mock.calls.at(-1)?.[0])).toContain(
      'keyword=missing-order'
    )
  )
  expect(await screen.findByText('Try adjusting your search')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Go to previous page' })
  ).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled()
})
