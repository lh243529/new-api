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
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { STATUS_QUERY_KEY } from '@/lib/status-query'
import { useAuthStore } from '@/stores/auth-store'
import { useSystemConfigStore } from '@/stores/system-config-store'

import { DocsHome } from '..'
import { DocsArticle } from '../article'
import { docArticles } from '../data'
import { DocsLayout } from '../layout'

let client: QueryClient

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
  client = new QueryClient({
    defaultOptions: { queries: { enabled: false, retry: false } },
  })
  client.setQueryData(STATUS_QUERY_KEY, {
    docs_link: 'https://docs.newapi.pro',
    HeaderNavModules: JSON.stringify({ docs: true }),
  })
  document.title = 'New API'
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

afterEach(() => {
  client.clear()
  localStorage.clear()
})

async function renderDocs(path = '/docs') {
  const root = createRootRoute()
  const docs = createRoute({
    getParentRoute: () => root,
    path: 'docs',
    component: DocsLayout,
  })
  const home = createRoute({
    getParentRoute: () => docs,
    path: '/',
    component: DocsHome,
  })
  const articles = docArticles.map((article) =>
    createRoute({
      getParentRoute: () => docs,
      path: article.slug,
      component: () => <DocsArticle slug={article.slug} />,
    })
  )
  const router = createRouter({
    routeTree: root.addChildren([docs.addChildren([home, ...articles])]),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  await router.load()
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
  return router
}

it('filters the four tutorials by case-insensitive keywords and shows an empty result', async () => {
  const user = userEvent.setup()
  await renderDocs()
  const sidebar = screen.getByRole('complementary', { name: '文档目录' })
  const search = within(sidebar).getByRole('searchbox', { name: '查找教程' })
  const main = screen.getByRole('main')
  expect(within(main).getAllByText('阅读教程')).toHaveLength(4)
  await user.type(search, 'ToMl')
  expect(within(main).getAllByText('阅读教程')).toHaveLength(1)
  expect(
    within(main).getByRole('heading', { name: 'Codex 配置教程' })
  ).toBeVisible()
  await user.clear(search)
  await user.type(search, '不存在的教程')
  expect(within(main).getByText('没有找到相关教程')).toBeVisible()
  expect(within(main).queryByText('阅读教程')).not.toBeInTheDocument()
})

it('opens a tutorial from its card and supports previous, next, back and forward navigation', async () => {
  const user = userEvent.setup()
  const router = await renderDocs()
  const main = screen.getByRole('main')
  await user.click(
    within(main).getByRole('link', { name: /Node.js 环境安装教程/ })
  )
  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Node.js 环境安装教程',
    })
  ).toBeVisible()
  const sidebar = screen.getByRole('complementary', { name: '文档目录' })
  expect(
    within(sidebar).getByRole('link', { name: 'Node.js 环境安装教程' })
  ).toHaveAttribute('aria-current', 'page')
  await user.click(
    within(screen.getByRole('navigation', { name: '前后篇教程' })).getByRole(
      'link',
      { name: /下一篇/ }
    )
  )
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Codex 配置教程' })
  ).toBeVisible()
  await act(() => router.history.back())
  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Node.js 环境安装教程',
    })
  ).toBeVisible()
  await act(() => router.history.forward())
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Codex 配置教程' })
  ).toBeVisible()
})

it('closes the mobile directory after selecting a tutorial and restores the trigger on Escape', async () => {
  const user = userEvent.setup()
  await renderDocs()
  const trigger = screen.getByRole('button', { name: '教程目录' })
  await user.click(trigger)
  const dialog = await screen.findByRole('dialog', { name: '文档目录' })
  expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await user.click(
    within(dialog).getByRole('link', { name: 'CC-Switch 配置教程' })
  )
  expect(
    await screen.findByRole('heading', { level: 1, name: 'CC-Switch 配置教程' })
  ).toBeVisible()
  await waitFor(() =>
    expect(
      screen.queryByRole('dialog', { name: '文档目录' })
    ).not.toBeInTheDocument()
  )
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await user.click(trigger)
  await screen.findByRole('dialog', { name: '文档目录' })
  await user.keyboard('{Escape}')
  await waitFor(() => expect(trigger).toHaveFocus())
})

it('switches operating system instructions with the keyboard and copies the visible command', async () => {
  const user = userEvent.setup()
  const writeText = vi.spyOn(navigator.clipboard, 'writeText')
  await renderDocs('/docs/nodejs')
  const windows = screen.getByRole('tab', { name: 'Windows' })
  expect(windows).toHaveAttribute('aria-selected', 'true')
  await user.click(windows)
  await user.keyboard('{ArrowRight}')
  await user.keyboard('{Enter}')
  await waitFor(() =>
    expect(screen.getByRole('tab', { name: 'macOS' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  )
  expect(screen.getByRole('tabpanel')).toHaveTextContent('.pkg')
  await user.click(screen.getByRole('tab', { name: 'Linux' }))
  expect(screen.getByRole('tabpanel')).toHaveTextContent('nvm install --lts')
  await user.click(screen.getByRole('button', { name: '复制Linux / nvm' }))
  expect(writeText).toHaveBeenCalledWith(
    'nvm install --lts\nnvm use --lts\nnvm alias default "lts/*"'
  )
})

it('links the table of contents to the matching section and retains it on direct entry', async () => {
  const user = userEvent.setup()
  const router = await renderDocs('/docs/codex#configure')
  expect(
    screen.getByRole('heading', { level: 1, name: 'Codex 配置教程' })
  ).toBeVisible()
  expect(router.state.location.hash).toBe('configure')
  const toc = screen.getByRole('navigation', { name: '本页内容' })
  const desktop = within(toc).getByRole('link', { name: '4. 在桌面端使用' })
  expect(desktop).toHaveAttribute('href', '/docs/codex#desktop')
  await user.click(desktop)
  await waitFor(() => expect(router.state.location.hash).toBe('desktop'))
  expect(document.querySelector('#desktop')).toHaveAccessibleName(
    '4. 在桌面端使用'
  )
})

it.each(docArticles)(
  'renders $slug on direct navigation with current-origin examples and placeholder credentials',
  async (article) => {
    await renderDocs(article.href)
    expect(
      screen.getByRole('heading', { level: 1, name: article.title })
    ).toBeVisible()
    if (article.slug === 'nodejs') return
    const code = screen.getByRole('main').querySelectorAll('pre')
    expect(
      [...code].some((block) =>
        block.textContent?.includes(window.location.origin)
      )
    ).toBe(true)
    if (article.slug === 'codex') {
      expect(screen.getByLabelText('config.toml')).toHaveTextContent(
        `${window.location.origin}/v1`
      )
      expect(screen.getByLabelText('auth.json')).toHaveTextContent(
        'YOUR_API_KEY'
      )
    }
    if (article.slug === 'claude-code') {
      expect(
        screen.getByLabelText('PowerShell：Claude Code 配置')
      ).toHaveTextContent('YOUR_CLAUDE_MODEL')
    }
  }
)
