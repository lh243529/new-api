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
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { List, X } from 'lucide-react'
import { useState } from 'react'

import { PublicLayout } from '@/components/layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { DocsNavigation } from './components/docs-navigation'
import { docArticles } from './data'
import { DocsSearchContext } from './search-context'

export function DocsLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname.replace(/\/$/, ''),
  })
  const article = docArticles.find((item) => item.href === pathname)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  return (
    <PublicLayout showMainContainer={false}>
      <div
        lang='zh-CN'
        className='mx-auto grid max-w-7xl gap-8 px-4 pt-24 pb-16 md:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12'
      >
        <aside
          aria-label='文档目录'
          className='sticky top-24 hidden h-fit max-h-[calc(100svh-7rem)] overflow-y-auto pr-2 lg:block'
        >
          <DocsNavigation
            activeSlug={article?.slug}
            query={query}
            onQueryChange={setQuery}
          />
        </aside>
        <main id='docs-main' className='min-w-0'>
          <div className='mb-8 flex flex-wrap items-center gap-4'>
            <div className='lg:hidden'>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger render={<Button variant='outline' size='sm' />}>
                  <List aria-hidden='true' />
                  教程目录
                </SheetTrigger>
                <SheetContent
                  side='left'
                  showCloseButton={false}
                  className='max-w-sm'
                >
                  <SheetHeader>
                    <SheetTitle>文档目录</SheetTitle>
                    <SheetDescription>
                      查找教程，选择要阅读的内容。
                    </SheetDescription>
                    <SheetClose
                      render={
                        <Button
                          variant='ghost'
                          size='icon'
                          className='absolute top-3 right-3'
                          aria-label='关闭目录'
                        />
                      }
                    >
                      <X aria-hidden='true' />
                    </SheetClose>
                  </SheetHeader>
                  <div className='overflow-y-auto px-4 pb-6'>
                    <DocsNavigation
                      activeSlug={article?.slug}
                      query={query}
                      onQueryChange={setQuery}
                      onNavigate={() => setOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <Breadcrumb aria-label='文档路径'>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link to='/' />}>首页</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {article ? (
                    <BreadcrumbLink render={<Link to='/docs' />}>
                      文档中心
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>文档中心</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {article && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{article.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <DocsSearchContext.Provider value={query}>
            <Outlet />
          </DocsSearchContext.Provider>
        </main>
      </div>
    </PublicLayout>
  )
}
