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
import { ArrowLeftRight, Code2, Terminal } from 'lucide-react'

export const docGroups = ['基础准备', '客户端接入'] as const

export const docArticles = [
  {
    slug: 'nodejs',
    href: '/docs/nodejs',
    group: '基础准备',
    title: 'Node.js 环境安装教程',
    description: '从安装 LTS 版本到验证终端环境，为命令行客户端做好准备。',
    keywords: 'node npm 环境 安装 windows macos linux PATH',
    icon: Terminal,
    label: '运行环境',
  },
  {
    slug: 'codex',
    href: '/docs/codex',
    group: '客户端接入',
    title: 'Codex 配置教程',
    description:
      '连接 Codex CLI 与桌面端，了解网关地址、模型和密钥的配置方式。',
    keywords: 'openai codex cli 桌面端 responses toml windows macos linux',
    icon: Code2,
    label: '命令行 / 桌面端',
  },
  {
    slug: 'claude-code',
    href: '/docs/claude-code',
    group: '客户端接入',
    title: 'Claude Code 配置教程',
    description: '安装 Claude Code，设置网关环境变量，并完成第一次连接验证。',
    keywords:
      'anthropic claude code cli messages windows macos linux git bash wsl',
    icon: Terminal,
    label: '命令行',
  },
  {
    slug: 'cc-switch',
    href: '/docs/cc-switch',
    group: '客户端接入',
    title: 'CC-Switch 配置教程',
    description:
      '通过图形界面管理提供商配置，在 Claude Code 与 Codex 之间轻松切换。',
    keywords: 'cc switch ccswitch 图形界面 导入 切换 windows macos linux',
    icon: ArrowLeftRight,
    label: '图形配置工具',
  },
] as const

export type DocSlug = (typeof docArticles)[number]['slug']

export function searchDocArticles(query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  return docArticles.filter((article) => {
    const text =
      `${article.title} ${article.description} ${article.keywords}`.toLowerCase()
    return terms.every((term) => text.includes(term))
  })
}
