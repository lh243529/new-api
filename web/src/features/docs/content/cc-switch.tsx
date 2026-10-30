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
import {
  DocCode,
  DocExternalLink,
  DocNotice,
  DocPlatforms,
  type DocSection,
} from '../components/article-content'

export function getCCSwitchSections(origin: string): DocSection[] {
  return [
    {
      id: 'about',
      title: '1. 了解 CC-Switch',
      content: (
        <>
          <p>
            CC-Switch 是用于管理 AI 编程客户端配置的图形工具，适合需要在多个 API
            提供商之间切换的用户。它负责管理配置，Codex 和 Claude Code
            客户端仍需分别安装。
          </p>
          <DocNotice title='先备份，再切换'>
            启用提供商可能修改客户端现有的配置文件。第一次使用前，请备份原来的配置；切换后检查当前模型与接口地址，避免把请求发到错误的服务。
          </DocNotice>
        </>
      ),
    },
    {
      id: 'download',
      title: '2. 下载并安装',
      content: (
        <>
          <p>
            从{' '}
            <DocExternalLink href='https://github.com/farion1231/cc-switch/releases/latest'>
              CC-Switch 官方 Releases
            </DocExternalLink>{' '}
            下载与你的系统和处理器匹配的安装包。不要使用来历不明的修改版。
          </p>
          <DocPlatforms
            items={[
              {
                label: 'Windows',
                content: (
                  <p>
                    选择 Windows 的 .msi
                    安装包；需要免安装使用时可选择官方提供的 Portable
                    压缩包。注意区分 x64 与 ARM64。
                  </p>
                ),
              },
              {
                label: 'macOS',
                content: (
                  <p>
                    选择 macOS
                    的安装包，按发布页说明安装并移入“应用程序”。如系统阻止打开，先核对下载来源和官方说明，不要直接关闭系统安全保护。
                  </p>
                ),
              },
              {
                label: 'Linux',
                content: (
                  <p>
                    根据发行版选择官方发布的 .deb、.rpm 或 AppImage
                    等适用格式。具体可用格式及运行依赖以当前版本的发布说明为准。
                  </p>
                ),
              },
            ]}
          />
        </>
      ),
    },
    {
      id: 'quick-import',
      title: '3. 从本站快捷导入',
      content: (
        <>
          <ol className='marker:text-muted-foreground list-decimal pl-5'>
            <li>安装并打开 CC-Switch，进入本站控制台的“令牌”页面。</li>
            <li>找到要使用的令牌，打开该行操作菜单中的“CC Switch”。</li>
            <li>
              选择 Claude 或 Codex，填写配置名称，并选择可用的主模型；Claude
              的其他模型字段按实际需要填写。
            </li>
            <li>
              点击“打开 CC Switch”，在系统提示中允许打开已安装的
              CC-Switch，核对导入内容并完成导入。
            </li>
          </ol>
          <DocNotice title='导入信息包含密钥'>
            此操作会把所选令牌传递给本机的
            CC-Switch。请只在自己信任的设备上使用，不要分享导入链接、二维码或包含密钥的截图。
          </DocNotice>
          <p>
            如果浏览器无法唤起应用，先确认 CC-Switch 已安装且支持 ccswitch
            协议，再尝试下面的手动方式。独立 API
            域名部署时，请在导入后核对并修正地址。
          </p>
        </>
      ),
    },
    {
      id: 'manual',
      title: '4. 手动添加提供商',
      content: (
        <>
          <p>
            在 CC-Switch
            中切换到目标客户端，添加自定义提供商。界面名称可能随版本变化，以下按字段含义填写：
          </p>
          <ul className='marker:text-muted-foreground list-disc pl-5'>
            <li>名称：使用容易识别的名称，例如“本站 Codex”或“本站 Claude”。</li>
            <li>API Key：填写在本站创建的完整 API 令牌。</li>
            <li>
              模型：从本站模型广场复制该令牌分组可用的模型名称，避免手动拼写。
            </li>
            <li>
              Claude 的主模型、Haiku、Sonnet、Opus
              映射：根据线路支持和实际需要填写，不要把不支持的模型作为可用映射。
            </li>
          </ul>
          <DocCode title='Codex 接口地址' code={`${origin}/v1`} />
          <DocCode title='Claude 接口地址' code={origin} />
          <p>
            Codex 使用 Responses 协议；Claude 使用 Anthropic Messages
            协议。不要把完整的 /responses 或 /v1/messages
            请求路径填进基础地址字段。
          </p>
        </>
      ),
    },
    {
      id: 'enable',
      title: '5. 启用并验证',
      content: (
        <>
          <ol className='marker:text-muted-foreground list-decimal pl-5'>
            <li>保存提供商，并在对应客户端列表中启用它。</li>
            <li>关闭并重新打开目标客户端；桌面应用需要完全退出后再启动。</li>
            <li>
              确认当前地址和模型，发送一条简单请求，并到本站使用日志中核对请求记录。
            </li>
          </ol>
          <p>
            如果配置没有生效，检查是否存在环境变量、另一套用户目录或不同运行环境的配置。尤其注意
            Windows 与 WSL 的配置文件彼此独立。
          </p>
          <p>
            更多功能和版本差异请参阅{' '}
            <DocExternalLink href='https://github.com/farion1231/cc-switch'>
              CC-Switch 项目说明
            </DocExternalLink>
            。本篇仅介绍提供商配置，不涉及 MCP 或本地代理的高级设置。
          </p>
        </>
      ),
    },
  ]
}
