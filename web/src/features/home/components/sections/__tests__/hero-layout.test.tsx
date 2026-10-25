import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Hero } from '../hero'

vi.mock('@tanstack/react-router', () => ({
  Link: (props: { to: string; children: ReactNode }) => (
    <a href={props.to}>{props.children}</a>
  ),
}))

vi.mock('../../hero-particle-scene', () => ({
  HeroParticleScene: (props: { mode?: string }) => (
    <div aria-hidden='true' data-mode={props.mode} data-testid='particle-scene' />
  ),
}))

describe('home hero layout', () => {
  it('places the existing signup actions and supported apps beneath the particle title', () => {
    render(<Hero isAuthenticated={false} />)

    const title = screen.getByRole('heading', { name: '灵渠API' })
    const signup = screen.getByRole('link', { name: /Get Started/ })
    const supportedApps = screen.getByText('Supported Applications')
    const appLink = screen.getByRole('link', { name: 'Cherry Studio' })

    expect(title).toBeInTheDocument()
    expect(signup).toHaveAttribute('href', '/sign-up')
    expect(signup.compareDocumentPosition(supportedApps) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(appLink.compareDocumentPosition(supportedApps) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
    expect(signup.parentElement).toHaveClass('justify-center')
    expect(appLink.parentElement).toHaveClass('justify-center')
    expect(screen.getByTestId('particle-scene')).toHaveAttribute('data-mode', 'text')
    expect(title.closest('section')).toHaveClass('md:min-h-[760px]')
    expect(title.closest('section')?.querySelector('[data-mode="text"]')).toBeInTheDocument()
  })

  it('keeps the dashboard action without a home hero docs button', () => {
    render(<Hero isAuthenticated />)

    expect(screen.getByRole('link', { name: /Go to Dashboard/ })).toHaveAttribute(
      'href',
      '/dashboard'
    )
    expect(screen.queryByRole('link', { name: /Docs/ })).toBeNull()
    expect(screen.queryByRole('link', { name: /Get Started/ })).toBeNull()
  })
})
