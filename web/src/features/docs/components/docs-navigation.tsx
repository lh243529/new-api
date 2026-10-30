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
import { BookOpen, Search } from 'lucide-react'
import { useId } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import {
  docArticles,
  docGroups,
  searchDocArticles,
  type DocSlug,
} from '../data'

export function DocsNavigation(props: {
  activeSlug?: DocSlug
  query: string
  onQueryChange: (value: string) => void
  onNavigate?: () => void
}) {
  const searchId = useId()
  const articles = searchDocArticles(props.query)

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2'>
        <label htmlFor={searchId} className='text-sm font-medium'>
          查找教程
        </label>
        <div className='relative'>
          <Search
            aria-hidden='true'
            className='text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4'
          />
          <Input
            id={searchId}
            type='search'
            placeholder='搜索标题或关键词'
            value={props.query}
            onChange={(event) => props.onQueryChange(event.target.value)}
            className='pl-9'
          />
        </div>
      </div>
      <nav aria-label='教程分类' className='flex flex-col gap-6'>
        <Link
          to='/docs'
          aria-current={!props.activeSlug ? 'page' : undefined}
          onClick={props.onNavigate}
          className={cn(
            'hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors',
            !props.activeSlug &&
              'bg-accent text-accent-foreground font-semibold'
          )}
        >
          <BookOpen aria-hidden='true' className='size-4' />
          文档首页
        </Link>
        {docGroups.map((group) => {
          const items = articles.filter((article) => article.group === group)
          if (!items.length) return null
          return (
            <div key={group} className='flex flex-col gap-2'>
              <h2 className='text-muted-foreground px-3 text-xs font-semibold tracking-wide'>
                {group}
              </h2>
              {items.map((article) => (
                <Link
                  key={article.slug}
                  to={article.href}
                  onClick={props.onNavigate}
                  aria-current={
                    props.activeSlug === article.slug ? 'page' : undefined
                  }
                  className={cn(
                    'text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg px-3 py-2.5 text-sm transition-colors',
                    props.activeSlug === article.slug &&
                      'bg-accent text-accent-foreground font-semibold'
                  )}
                >
                  {article.title}
                </Link>
              ))}
            </div>
          )
        })}
        {!articles.length && (
          <p role='status' className='text-muted-foreground px-3 text-sm'>
            没有找到相关教程，请更换关键词。
          </p>
        )}
      </nav>
      <p className='text-muted-foreground border-t px-3 pt-4 text-xs leading-6'>
        从运行环境开始，按步骤连接你的 AI 编程工具。
      </p>
      <span className='sr-only'>共 {docArticles.length} 篇教程</span>
    </div>
  )
}
