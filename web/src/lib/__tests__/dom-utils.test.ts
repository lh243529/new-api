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

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { applySystemTitleToDom } from '@/lib/dom-utils'

const template = readFileSync('index.html', 'utf8')
const originalHead = document.head.innerHTML
const originalUrl = window.location.href

beforeEach(() => {
  document.head.innerHTML = new DOMParser().parseFromString(
    template,
    'text/html'
  ).head.innerHTML
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  document.head.innerHTML = originalHead
  window.history.replaceState(null, '', originalUrl)
})

describe('system branding titles', () => {
  it('keeps the template homepage title when cached branding is applied', () => {
    const homepageTitle = document.title

    applySystemTitleToDom('Cached site name')

    expect(document.title).toBe(homepageTitle)
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="title"]')?.content
    ).toBe(homepageTitle)
  })

  it('keeps the homepage title when branding resolves after navigation back home', async () => {
    const homepageTitle = document.title
    window.history.replaceState(null, '', '/pricing')
    applySystemTitleToDom('Current site name')
    const refresh = Promise.resolve('Refreshed site name').then(
      applySystemTitleToDom
    )
    window.history.replaceState(null, '', '/?aff=example#features')

    await refresh

    expect(document.title).toBe(homepageTitle)
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="title"]')?.content
    ).toBe(homepageTitle)
  })

  it('uses the configured site title outside the homepage', () => {
    window.history.replaceState(null, '', '/pricing')

    applySystemTitleToDom('Configured site name')

    expect(document.title).toBe('Configured site name')
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="title"]')?.content
    ).toBe('Configured site name')
  })
})

describe('static SEO assets', () => {
  it('provides the requested SEO and verification tags exactly once in the initial HTML', () => {
    const title = '奇流 - 专业高效的 API 聚合与转发生态平台'
    const description =
      '奇流（QiLiu）提供稳定、高效的接口聚合、大模型调度与中转分发服务，助力开发者快速接入多模态 AI 能力与业务系统。'
    const meta = {
      title,
      description,
      keywords: '奇流,QiLiu,奇流API,API接口,API聚合,接口转发生态',
      'baidu-site-verification': 'codeva-KmlPpZN5Om',
    }
    const openGraph = {
      'og:title': title,
      'og:description': description,
      'og:url': 'https://qiliu.top',
      'og:type': 'website',
      'og:site_name': '奇流',
    }

    expect(document.querySelectorAll('title')).toHaveLength(1)
    expect(document.title).toBe(title)
    for (const [name, content] of Object.entries(meta)) {
      const tags = document.querySelectorAll<HTMLMetaElement>(
        `meta[name="${name}"]`
      )
      expect(tags, name).toHaveLength(1)
      expect(tags[0].content, name).toBe(content)
    }
    for (const [property, content] of Object.entries(openGraph)) {
      const tags = document.querySelectorAll<HTMLMetaElement>(
        `meta[property="${property}"]`
      )
      expect(tags, property).toHaveLength(1)
      expect(tags[0].content, property).toBe(content)
    }
  })

  it('exposes valid WebSite structured data without executing JavaScript', () => {
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    )

    expect(scripts).toHaveLength(1)
    expect(JSON.parse(scripts[0].textContent || '')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '奇流',
      alternateName: ['QiLiu', '奇流API'],
      url: 'https://qiliu.top/',
    })
  })

  it('allows crawling and advertises the public sitemap with a plain URL', () => {
    expect(readFileSync('public/robots.txt', 'utf8')).toBe(
      'User-agent: *\nAllow: /\nSitemap: https://qiliu.top/sitemap.xml\n'
    )
  })

  it('lists the homepage with the requested frequency and priority in a valid sitemap', () => {
    const xml = new DOMParser().parseFromString(
      readFileSync('public/sitemap.xml', 'utf8'),
      'application/xml'
    )

    expect(xml.querySelector('parsererror')).toBeNull()
    expect(xml.documentElement.localName).toBe('urlset')
    expect(xml.documentElement.namespaceURI).toBe(
      'http://www.sitemaps.org/schemas/sitemap/0.9'
    )
    const urls = xml.querySelectorAll('url')
    expect(urls).toHaveLength(1)
    expect(urls[0].querySelector('loc')?.textContent).toBe('https://qiliu.top/')
    expect(urls[0].querySelector('changefreq')?.textContent).toBe('daily')
    expect(urls[0].querySelector('priority')?.textContent).toBe('1.0')
    expect(urls[0].querySelector('lastmod')).toBeNull()
  })
})
