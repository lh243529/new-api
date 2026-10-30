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
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, it } from 'vitest'

import { STATUS_QUERY_KEY, type StatusData } from '@/lib/status-query'

import { useTopNavLinks } from '../use-top-nav-links'

const clients: QueryClient[] = []

afterEach(() => {
  clients.forEach((client) => client.clear())
  clients.length = 0
  localStorage.clear()
})

function renderLinks(status: StatusData) {
  const client = new QueryClient({
    defaultOptions: { queries: { enabled: false, retry: false } },
  })
  clients.push(client)
  client.setQueryData(STATUS_QUERY_KEY, status)
  return renderHook(useTopNavLinks, {
    wrapper: (props: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        {props.children}
      </QueryClientProvider>
    ),
  })
}

it.each([
  undefined,
  null,
  '',
  '  ',
  'https://docs.newapi.pro',
  'https://docs.newapi.pro/',
  '/docs',
  ' /docs ',
])(
  'opens the built-in docs in the current tab when docs_link is %s',
  (docsLink) => {
    const { result } = renderLinks({ docs_link: docsLink })
    const link = result.current.find((item) => item.title === 'Docs')
    expect(link?.href).toBe('/docs')
    expect(link?.external).not.toBe(true)
  }
)

it('preserves an administrator-provided external documentation URL', () => {
  const { result } = renderLinks({
    docs_link: 'https://guide.example.com/docs',
  })
  expect(result.current.find((item) => item.title === 'Docs')).toMatchObject({
    href: 'https://guide.example.com/docs',
    external: true,
  })
})

it('hides documentation when the navigation module is disabled', () => {
  const { result } = renderLinks({
    HeaderNavModules: JSON.stringify({ docs: false }),
  })
  expect(result.current.some((item) => item.title === 'Docs')).toBe(false)
})
