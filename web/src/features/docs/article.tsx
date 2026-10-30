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
import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Hash } from 'lucide-react'
import { useEffect } from 'react'

import { getCCSwitchSections } from './content/cc-switch'
import { getClaudeCodeSections } from './content/claude-code'
import { getCodexSections } from './content/codex'
import { nodejsSections } from './content/nodejs'
import { docArticles, type DocSlug } from './data'

export function DocsArticle(props: { slug: DocSlug }) {
  const index = docArticles.findIndex((item) => item.slug === props.slug)
  const article = docArticles[index]
  const previous = docArticles[index - 1]
  const next = docArticles[index + 1]
  const origin = window.location.origin
  let sections = nodejsSections
  if (props.slug === 'codex') sections = getCodexSections(origin)
  if (props.slug === 'claude-code') sections = getClaudeCodeSections(origin)
  if (props.slug === 'cc-switch') sections = getCCSwitchSections(origin)

  useEffect(() => {
    const previousTitle = document.title
    document.title = `${article.title} · 文档中心 · ${previousTitle}`
    return () => {
      document.title = previousTitle
    }
  }, [article.title])

  return (
    <article className='min-w-0'>
      <header className='mb-8 flex flex-col gap-4 border-b pb-8'>
        <span className='text-primary text-sm font-medium'>
          {article.group}
        </span>
        <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
          {article.title}
        </h1>
        <p className='text-muted-foreground max-w-2xl text-base leading-8'>
          {article.description}
        </p>
      </header>
      <nav
        aria-label='本页内容'
        className='bg-muted/40 mb-10 rounded-xl border p-5'
      >
        <p className='mb-3 text-sm font-semibold'>本页内容</p>
        <ol className='grid gap-2 sm:grid-cols-2'>
          {sections.map((section) => (
            <li key={section.id}>
              <Link
                to={article.href}
                hash={section.id}
                className='text-muted-foreground hover:text-primary text-sm leading-7'
              >
                {section.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <div className='flex min-w-0 flex-col gap-12'>
        {sections.map((section) => (
          <section
            key={`${props.slug}-${section.id}`}
            id={section.id}
            aria-labelledby={`label-${section.id}`}
            className='min-w-0 scroll-mt-28'
          >
            <h2
              id={`heading-${section.id}`}
              className='mb-5 flex items-center gap-2 text-xl font-semibold tracking-tight'
            >
              <span id={`label-${section.id}`}>{section.title}</span>
              <Link
                to={article.href}
                hash={section.id}
                aria-label={`定位到${section.title}`}
                className='text-muted-foreground hover:text-primary rounded p-1'
              >
                <Hash aria-hidden='true' className='size-4' />
              </Link>
            </h2>
            <div className='flex min-w-0 flex-col gap-4 text-sm leading-8 [&_li+li]:mt-2'>
              {section.content}
            </div>
          </section>
        ))}
      </div>
      <nav
        aria-label='前后篇教程'
        className='mt-12 grid gap-4 border-t pt-6 sm:grid-cols-2'
      >
        <Link
          to={previous?.href ?? '/docs'}
          className='hover:bg-accent flex items-center gap-3 rounded-xl border p-4 transition-colors'
        >
          <ArrowLeft aria-hidden='true' className='size-4 shrink-0' />
          <span className='flex flex-col gap-1'>
            <span className='text-muted-foreground text-xs'>上一篇</span>
            <span className='text-sm font-medium'>
              {previous?.title ?? '文档首页'}
            </span>
          </span>
        </Link>
        {next && (
          <Link
            to={next.href}
            className='hover:bg-accent flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors'
          >
            <span className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-xs'>下一篇</span>
              <span className='text-sm font-medium'>{next.title}</span>
            </span>
            <ArrowRight aria-hidden='true' className='size-4 shrink-0' />
          </Link>
        )}
      </nav>
    </article>
  )
}
