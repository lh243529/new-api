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
import { ArrowUpRight, BookOpen, ChevronRight } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { DocExternalLink, DocNotice } from './components/article-content'
import { docGroups, searchDocArticles } from './data'
import { useDocsSearch } from './search-context'

export function DocsHome() {
  const query = useDocsSearch()
  const articles = searchDocArticles(query)

  return (
    <div className='flex flex-col gap-10'>
      <header className='flex flex-col gap-5 border-b pb-8'>
        <div className='text-primary flex items-center gap-2 text-sm font-medium'>
          <BookOpen aria-hidden='true' className='size-4' />
          接入指南
        </div>
        <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
          从这里，开始连接。
        </h1>
        <p className='text-muted-foreground max-w-2xl text-base leading-8'>
          准备运行环境，选择熟悉的工具，再完成第一次调用。这里整理了从 Node.js
          安装到 AI 编程客户端配置的完整路径。
        </p>
        <div className='text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 text-xs'>
          <span>简体中文</span>
          <span>4 篇入门教程</span>
          <span>Windows / macOS / Linux</span>
        </div>
      </header>
      <DocNotice title='第一次使用？'>
        先在本站控制台创建 API
        令牌，再从模型广场确认可用模型。命令行工具可先阅读 Node.js
        教程；偏好图形界面管理配置，可以从 CC-Switch 开始。
      </DocNotice>
      {query.trim() && (
        <p role='status' className='text-muted-foreground text-sm'>
          找到 {articles.length} 篇相关教程
        </p>
      )}
      {!articles.length && (
        <EmptyState
          title='没有找到相关教程'
          description='试试客户端名称、安装、Windows 或配置等关键词。'
        />
      )}
      {docGroups.map((group) => {
        const items = articles.filter((article) => article.group === group)
        if (!items.length) return null
        return (
          <section
            key={group}
            aria-label={group}
            className='flex flex-col gap-5'
          >
            <div className='flex items-baseline gap-3'>
              <h2 className='text-xl font-semibold tracking-tight'>{group}</h2>
              <span className='text-muted-foreground text-xs'>
                {group === '基础准备' ? '先把环境准备好' : '选择你的工作方式'}
              </span>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              {items.map((article) => (
                <Link
                  key={article.slug}
                  to={article.href}
                  className='group rounded-xl outline-offset-4'
                >
                  <Card className='hover:ring-primary/40 h-full transition-shadow'>
                    <CardHeader className='gap-4 p-2'>
                      <div className='flex items-center justify-between'>
                        <span className='bg-muted text-foreground flex size-10 items-center justify-center rounded-lg'>
                          <article.icon aria-hidden='true' className='size-5' />
                        </span>
                        <ArrowUpRight
                          aria-hidden='true'
                          className='text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                        />
                      </div>
                      <div className='flex flex-col gap-2'>
                        <span className='text-muted-foreground text-xs'>
                          {article.label}
                        </span>
                        <CardTitle>
                          <h3>{article.title}</h3>
                        </CardTitle>
                        <CardDescription className='leading-7'>
                          {article.description}
                        </CardDescription>
                      </div>
                      <span className='text-primary inline-flex items-center gap-1 text-xs font-medium'>
                        阅读教程
                        <ChevronRight aria-hidden='true' className='size-3' />
                      </span>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
      <footer className='text-muted-foreground flex flex-col gap-2 border-t pt-6 text-sm leading-7'>
        <p>
          需要了解网关的更多能力？阅读{' '}
          <DocExternalLink href='https://docs.newapi.pro'>
            New API 官方文档
          </DocExternalLink>
          。
        </p>
        <p className='text-xs'>
          本页聚焦客户端入门。客户端界面可能随版本变化，安装包和高级设置请以各工具官方说明为准。
        </p>
      </footer>
    </div>
  )
}
