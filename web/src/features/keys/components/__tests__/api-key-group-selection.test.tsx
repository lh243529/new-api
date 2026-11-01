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
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster, toast } from 'sonner'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { api } from '@/lib/api'

import { apiKeySchema } from '../../types'
import { ApiKeyGroupSelector } from '../api-key-group-selector'

const key = apiKeySchema.parse({
  id: 7,
  name: 'production',
  key: 'masked-key',
  status: 1,
  remain_quota: 100,
  used_quota: 20,
  unlimited_quota: false,
  expired_time: -1,
  created_time: 1,
  accessed_time: 1,
  group: 'default',
  model_limits_enabled: false,
})
const options = [
  { value: '', label: 'Follow user group' },
  { value: 'default', label: 'default', ratio: 1 },
  { value: 'vip', label: 'vip', desc: 'Priority routing', ratio: 0.2 },
  { value: 'auto', label: 'auto', ratio: 'auto' },
]
let client: QueryClient

function Harness(props: {
  disabled?: boolean
  availableOptions?: typeof options
}) {
  const { data } = useQuery({
    queryKey: ['keys', 1, 'production'],
    queryFn: async () => ({ items: [key], total: 1 }),
    initialData: { items: [key], total: 1 },
    enabled: false,
  })
  return (
    <ApiKeyGroupSelector
      apiKey={data.items[0]}
      options={props.availableOptions ?? options}
      disabled={props.disabled ?? false}
      ratio={
        options.find((option) => option.value === data.items[0].group)?.ratio
      }
      shouldReduceMotion
    />
  )
}

function renderSelector(props: Parameters<typeof Harness>[0] = {}) {
  return render(
    <QueryClientProvider client={client}>
      <Harness {...props} />
      <Toaster />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
})
afterEach(() => {
  cleanup()
  client.clear()
  toast.dismiss()
})

it('searches and immediately saves only the selected group, then shows the saved value', async () => {
  const put = vi.spyOn(api, 'put').mockResolvedValue({
    data: { success: true, data: { ...key, group: 'vip' } },
  })
  const user = userEvent.setup()
  renderSelector()
  const trigger = screen.getByRole('combobox', {
    name: 'Change group for production',
  })
  expect(trigger).toHaveTextContent('default')
  await user.click(trigger)
  await user.type(screen.getByPlaceholderText('Search...'), 'Priority')
  await user.click(screen.getByRole('option', { name: /vip/ }))
  await waitFor(() => expect(trigger).toHaveTextContent('vip'))
  expect(trigger).toHaveTextContent('0.2x')
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(put).toHaveBeenCalledExactlyOnceWith('/api/token/?group_only=true', {
    id: 7,
    group: 'vip',
  })
})

it('keeps the saved group and disables selection while the request is pending', async () => {
  let resolve!: (value: {
    data: { success: boolean; data: typeof key }
  }) => void
  vi.spyOn(api, 'put').mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done
      })
  )
  const user = userEvent.setup()
  renderSelector()
  const trigger = screen.getByRole('combobox')
  await user.click(trigger)
  await user.click(screen.getByRole('option', { name: /vip/ }))
  await waitFor(() => expect(trigger).toBeDisabled())
  expect(trigger).toHaveTextContent('default')
  resolve({ data: { success: true, data: { ...key, group: 'vip' } } })
  await waitFor(() => expect(trigger).toBeEnabled())
  expect(trigger).toHaveTextContent('vip')
})

it.each(['business', 'network'])(
  'retains the original group and permits retry after a %s failure',
  async (kind) => {
    const put = vi.spyOn(api, 'put')
    if (kind === 'business') {
      put.mockResolvedValue({
        data: {
          success: false,
          message: 'Group is unavailable or unauthorized',
        },
      })
    } else put.mockRejectedValue(new Error('Connection failed'))
    const user = userEvent.setup()
    renderSelector()
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    await user.click(screen.getByRole('option', { name: /vip/ }))
    await screen.findByText(
      kind === 'business'
        ? 'Group is unavailable or unauthorized'
        : 'Connection failed'
    )
    expect(trigger).toHaveTextContent('default')
    expect(trigger).toBeEnabled()
    await user.click(trigger)
    expect(screen.getByRole('option', { name: /vip/ })).toBeVisible()
  }
)

it('closes without saving when the existing group is selected', async () => {
  const put = vi.spyOn(api, 'put')
  const user = userEvent.setup()
  renderSelector()
  await user.click(screen.getByRole('combobox'))
  await user.click(screen.getByRole('option', { name: /default/ }))
  expect(put).not.toHaveBeenCalled()
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
})

it.each([
  ['Follow user group', ''],
  ['auto', 'auto'],
])(
  'saves %s using the keyboard and displays the new selection',
  async (label, group) => {
    const put = vi
      .spyOn(api, 'put')
      .mockResolvedValue({ data: { success: true, data: { ...key, group } } })
    const user = userEvent.setup()
    renderSelector()
    await user.tab()
    expect(screen.getByRole('combobox')).toHaveFocus()
    await user.keyboard('{Enter}')
    await user.type(screen.getByPlaceholderText('Search...'), label)
    await user.keyboard('{ArrowDown}{Enter}')
    await waitFor(() =>
      expect(put).toHaveBeenCalledWith('/api/token/?group_only=true', {
        id: 7,
        group,
      })
    )
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveTextContent(
        group === '' ? 'User Group' : 'Cross-group'
      )
    )
  }
)

it('hides Auto when it is unavailable and supports an empty search result', async () => {
  const user = userEvent.setup()
  renderSelector({
    availableOptions: options.filter((option) => option.value !== 'auto'),
  })
  await user.click(screen.getByRole('combobox'))
  expect(
    screen.queryByRole('option', { name: /auto/i })
  ).not.toBeInTheDocument()
  await user.type(screen.getByPlaceholderText('Search...'), 'no-such-group')
  expect(screen.getByText('No group found.')).toBeVisible()
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus())
})

it('does not open the group selector while group data is unavailable', async () => {
  const user = userEvent.setup()
  renderSelector({ disabled: true })
  await user.click(screen.getByRole('combobox'))
  expect(screen.getByRole('combobox')).toBeDisabled()
  expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
})
