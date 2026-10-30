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
import type { ReactNode } from 'react'

import { CodeBlockFrame } from '@/components/ai-elements/code-block'
import { CopyButton } from '@/components/copy-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type DocSection = {
  id: string
  title: string
  content: ReactNode
}

export function DocCode(props: { code: string; title: string }) {
  return (
    <CodeBlockFrame
      showToolbar
      title={props.title}
      endActions={
        <CopyButton
          value={props.code}
          size='sm'
          tooltip='复制代码'
          successTooltip='已复制'
          aria-label={`复制${props.title}`}
        />
      }
    >
      <pre
        tabIndex={0}
        aria-label={props.title}
        className='m-0 w-full p-4 font-mono text-xs leading-7 sm:text-sm'
      >
        <code>{props.code}</code>
      </pre>
    </CodeBlockFrame>
  )
}

export function DocNotice(props: { title: string; children: ReactNode }) {
  return (
    <Alert>
      <AlertTitle>{props.title}</AlertTitle>
      <AlertDescription>{props.children}</AlertDescription>
    </Alert>
  )
}

export function DocExternalLink(props: { href: string; children: ReactNode }) {
  return (
    <a
      href={props.href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-primary font-medium underline underline-offset-4'
    >
      {props.children}
    </a>
  )
}

export function DocPlatforms(props: {
  items: { label: string; content: ReactNode }[]
}) {
  return (
    <Tabs defaultValue={props.items[0].label} className='min-w-0 gap-4'>
      <TabsList aria-label='操作系统' className='h-auto max-w-full flex-wrap'>
        {props.items.map((item) => (
          <TabsTrigger
            key={item.label}
            value={item.label}
            className='px-3 py-1.5'
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {props.items.map((item) => (
        <TabsContent
          key={item.label}
          value={item.label}
          className='flex min-w-0 flex-col gap-4 leading-7'
        >
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
