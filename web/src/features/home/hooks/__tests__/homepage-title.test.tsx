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
import { readFileSync } from 'node:fs'

import { QueryClient } from '@tanstack/react-query'
import { cleanup, renderHook } from '@testing-library/react'
import { StrictMode, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/lib/api'
import { applyPageTitleToDom, applySystemTitleToDom } from '@/lib/dom-utils'
import { statusQueryOptions } from '@/lib/status-query'
import { useSystemConfigStore } from '@/stores/system-config-store'

import { useHomepageTitle } from '../use-homepage-title'

const template = readFileSync('index.html', 'utf8')
const originalHead = document.head.innerHTML
const originalUrl = window.location.href
let homepageTitle: string
let queryClient: QueryClient

function StrictModeWrapper(props: { children: ReactNode }) {
  return <StrictMode>{props.children}</StrictMode>
}

beforeEach(() => {
  document.head.innerHTML = new DOMParser().parseFromString(
    template,
    'text/html'
  ).head.innerHTML
  window.history.replaceState(null, '', '/')
  homepageTitle = document.title
  window.localStorage.clear()
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
  useSystemConfigStore.getState().setConfig({ systemName: 'Cached site name' })
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
})

afterEach(() => {
  cleanup()
  queryClient.clear()
  vi.restoreAllMocks()
  window.localStorage.clear()
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
  document.head.innerHTML = originalHead
  window.history.replaceState(null, '', originalUrl)
})

describe('homepage title lifecycle', () => {
  it('restores the SEO title when entering from a document page, including Strict Mode remounts', () => {
    applyPageTitleToDom('Article · Documentation · Cached site name')
    window.history.replaceState(null, '', '/?aff=example#features')

    renderHook(useHomepageTitle, { wrapper: StrictModeWrapper })

    expect(document.title).toBe(homepageTitle)
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="title"]')?.content
    ).toBe(homepageTitle)
  })

  it('keeps the SEO title after a successful status refresh and restores the latest site name on exit', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      data: { success: true, data: { system_name: 'Refreshed site name' } },
    })
    const home = renderHook(useHomepageTitle)

    const status = await queryClient.ensureQueryData(statusQueryOptions)
    applySystemTitleToDom(status?.system_name as string)

    expect(document.title).toBe(homepageTitle)
    expect(useSystemConfigStore.getState().config.systemName).toBe(
      'Refreshed site name'
    )

    window.history.replaceState(null, '', '/pricing')
    home.unmount()

    expect(document.title).toBe('Refreshed site name')
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="title"]')?.content
    ).toBe('Refreshed site name')

    window.history.replaceState(null, '', '/')
    renderHook(useHomepageTitle)
    expect(document.title).toBe(homepageTitle)
  })

  it('retains the SEO title on refresh failure and falls back to the cached site name on exit', async () => {
    vi.spyOn(api, 'get').mockRejectedValue(new Error('Status unavailable'))
    const home = renderHook(useHomepageTitle)

    await expect(
      queryClient.ensureQueryData(statusQueryOptions)
    ).rejects.toThrow('Status unavailable')

    expect(document.title).toBe(homepageTitle)
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="title"]')?.content
    ).toBe(homepageTitle)
    window.history.replaceState(null, '', '/pricing')
    home.unmount()
    expect(document.title).toBe('Cached site name')
  })
})
