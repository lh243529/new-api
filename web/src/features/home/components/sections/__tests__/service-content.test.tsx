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
import { act, render, screen, within } from '@testing-library/react'
import { createInstance, type i18n } from 'i18next'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import en from '@/i18n/locales/en.json'
import zhCN from '@/i18n/locales/zh.json'

import { CTA } from '../cta'
import { Features } from '../features'
import { HowItWorks } from '../how-it-works'
import { Stats } from '../stats'

vi.mock('@tanstack/react-router', () => ({
  Link: (props: { to: string; children?: ReactNode }) => (
    <a href={props.to}>{props.children}</a>
  ),
}))

let translations: i18n

beforeEach(async () => {
  translations = createInstance()
  await translations.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en, zhCN },
    interpolation: { escapeValue: false },
  })
})

describe('QiFlow home service content', () => {
  it('lists exactly the five supported providers with local theme-aware icons', () => {
    render(
      <I18nextProvider i18n={translations}>
        <Stats />
      </I18nextProvider>
    )

    const band = screen.getByRole('region', {
      name: 'Five model providers. One gateway.',
    })
    const providers = within(band).getAllByRole('listitem')
    expect(providers.map((provider) => provider.textContent)).toEqual([
      'OpenAI',
      'Claude',
      'DeepSeek',
      'Zhipu',
      'XAI',
    ])
    for (const provider of providers) {
      const name = provider.textContent ?? ''
      const icon = provider.querySelector('img')
      expect(icon).toHaveAttribute('src', `/model/${name.toLowerCase()}.svg`)
      expect(icon).toHaveAttribute('alt', '')
      if (name === 'OpenAI' || name === 'XAI') {
        expect(icon).toHaveClass('dark:invert')
      }
    }
    expect(band).toHaveTextContent('current availability and pricing')
    expect(band).not.toHaveTextContent(/50\+|100\+|10\+/)
  })

  it('explains client and developer use cases without gateway administration claims', () => {
    render(
      <I18nextProvider i18n={translations}>
        <Features />
        <HowItWorks />
        <CTA />
      </I18nextProvider>
    )

    for (const name of [
      'Many models, one connection',
      'Familiar tools, simple setup',
      'A clear path from app to API',
      'Know what you use',
      'Everyday conversations',
      'Coding assistance',
      'Content creation',
      'Application development',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeVisible()
    }
    expect(
      screen.getByRole('img', {
        name: 'Five providers, through QiFlow, to your tools and apps',
      })
    ).toBeVisible()
    expect(screen.getByText('Cherry Studio')).toBeVisible()
    expect(screen.getByText('CC Switch')).toBeVisible()
    expect(
      screen.queryByText('QiFlow for your workflow')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Variety upstream. Flow in your hands.')
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'QiFlow services' })
    ).toHaveTextContent(
      'One clear path from model selection to tool setup, application calls, and usage tracking.'
    )
    expect(document.body).not.toHaveTextContent(
      /Gemini|Qwen|Llama|self-host|millisecond|Multi-region deployment|set up channels/i
    )
  })

  it('guides users through wallet preparation, API key creation, and app setup in order', () => {
    render(
      <I18nextProvider i18n={translations}>
        <HowItWorks />
      </I18nextProvider>
    )
    const steps = screen.getByRole('region', {
      name: 'Three steps to bring models into your workflow',
    })
    expect(
      within(steps)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent)
    ).toEqual([
      'Sign up and add funds',
      'Create an API key',
      'Connect your tool or app',
    ])
    expect(steps).toHaveTextContent('add funds in your wallet')
  })

  it('switches all lower sections from English to the approved Simplified Chinese copy', async () => {
    render(
      <I18nextProvider i18n={translations}>
        <Stats />
        <Features />
        <HowItWorks />
        <CTA />
      </I18nextProvider>
    )

    await act(() => translations.changeLanguage('zhCN'))

    for (const name of [
      '五家模型，一个入口',
      '多家模型，一处接入',
      '常用工具，轻松配置',
      '应用开发，接入有章',
      '每次使用，清楚可查',
      '三步，把模型接入你的工作流',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeVisible()
    }
    expect(
      screen.getByRole('heading', { name: /千奇汇流，\s*从这里开始/ })
    ).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Know what you use' })
    ).not.toBeInTheDocument()
    expect(screen.getByText('奇流')).toBeVisible()
    expect(screen.queryByText('为你的工作流而来')).not.toBeInTheDocument()
    expect(screen.queryByText('奇在上游，流在你手')).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: '奇流服务' })).toHaveTextContent(
      '从模型选择到工具配置、应用调用与用量管理，让每一步都有清晰的路径。'
    )
    expect(screen.getByRole('link', { name: /开始使用/ })).toHaveAttribute(
      'href',
      '/sign-up'
    )
    expect(screen.getByRole('link', { name: /查看定价/ })).toHaveAttribute(
      'href',
      '/pricing'
    )
  })

  it('retains the signup and pricing destinations for visitors', () => {
    render(
      <I18nextProvider i18n={translations}>
        <CTA isAuthenticated={false} />
      </I18nextProvider>
    )
    expect(screen.getByRole('link', { name: /Get Started/ })).toHaveAttribute(
      'href',
      '/sign-up'
    )
    expect(screen.getByRole('link', { name: /View Pricing/ })).toHaveAttribute(
      'href',
      '/pricing'
    )
  })

  it('hides the signup invitation when the user is already signed in', () => {
    const { container } = render(
      <I18nextProvider i18n={translations}>
        <CTA isAuthenticated />
      </I18nextProvider>
    )
    expect(container).toBeEmptyDOMElement()
  })
})
