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

export function getCodexSections(origin: string): DocSection[] {
  return [
    {
      id: 'prepare',
      title: '1. 准备接口与模型',
      content: (
        <>
          <p>
            Codex 可以通过兼容 OpenAI Responses
            协议的网关连接本站。先在控制台创建 API
            令牌，再从模型广场复制该令牌分组支持的模型名称，替换下文的
            YOUR_CODEX_MODEL。
          </p>
          <DocCode title='Codex 基础地址' code={`${origin}/v1`} />
          <DocNotice title='确认线路支持 Responses'>
            基础地址包含 /v1，不要继续添加 /responses。若使用独立 API
            域名，请改用控制台公布的接口地址；模型名称存在并不代表对应线路一定支持
            Responses 协议。
          </DocNotice>
        </>
      ),
    },
    {
      id: 'install',
      title: '2. 安装 Codex CLI',
      content: (
        <>
          <p>先准备好 Node.js 环境，然后运行：</p>
          <DocCode
            title='安装 Codex CLI'
            code={'npm install -g @openai/codex\ncodex --version'}
          />
          <DocPlatforms
            items={[
              {
                label: 'Windows',
                content: (
                  <p>
                    在 PowerShell 中安装并启动。若 npm.ps1
                    受执行策略限制，可使用 npm.cmd。使用 WSL 时，应在 WSL
                    中单独安装，并使用 Linux 用户目录下的配置。
                  </p>
                ),
              },
              {
                label: 'macOS',
                content: (
                  <p>
                    在“终端”中运行安装命令。已经使用 Homebrew
                    或官方二进制版本时，不必重复通过 npm 安装，先检查 codex
                    --version 与实际执行路径。
                  </p>
                ),
              },
              {
                label: 'Linux',
                content: (
                  <p>
                    在安装了受支持 Node.js
                    版本的终端中运行命令。使用用户级版本管理器可以避免全局 npm
                    安装的目录权限问题。
                  </p>
                ),
              },
            ]}
          />
        </>
      ),
    },
    {
      id: 'configure',
      title: '3. 配置自定义网关',
      content: (
        <>
          <p>
            关闭正在运行的 Codex，备份用户配置，再合并下面的设置。Windows
            默认位置为 %USERPROFILE%\.codex\config.toml，macOS / Linux 为
            ~/.codex/config.toml。如果设置了自定义 Codex
            用户目录，请使用该目录下的文件。
          </p>
          <DocCode
            title='config.toml'
            code={`model = "YOUR_CODEX_MODEL"\nmodel_provider = "site_gateway"\n\n[model_providers.site_gateway]\nname = "本站 API"\nbase_url = "${origin}/v1"\nwire_api = "responses"\nrequires_openai_auth = true`}
          />
          <p>
            在同一个 .codex 目录下配置 auth.json。把 YOUR_API_KEY
            换成本站令牌；这里的键名 OPENAI_API_KEY
            是客户端配置格式，值应填写本站令牌。
          </p>
          <DocCode
            title='auth.json'
            code={'{\n  "OPENAI_API_KEY": "YOUR_API_KEY"\n}'}
          />
          <DocNotice title='保护并备份登录配置'>
            auth.json 包含可用密钥，只保存在自己的用户目录中，不要提交到 Git
            或分享截图。已有订阅登录或其他提供商配置时，先完整备份；不要直接覆盖原有文件。组织管理的客户端可能限制自定义提供商，请遵循管理员配置。
          </DocNotice>
          <p>
            上述示例适用于本地 API Key 方式。它不会让本站令牌获得 ChatGPT
            订阅、云端任务或其他账号权益。
          </p>
        </>
      ),
    },
    {
      id: 'desktop',
      title: '4. 在桌面端使用',
      content: (
        <>
          <p>
            桌面端与 CLI 是不同的安装入口。通过{' '}
            <DocExternalLink href='https://developers.openai.com/codex/app/'>
              Codex 官方桌面端说明
            </DocExternalLink>{' '}
            获取适用于自己系统和处理器的版本，也可以在已安装 CLI 的机器上运行
            codex app 打开桌面端或安装入口。
          </p>
          <DocPlatforms
            items={[
              {
                label: 'Windows',
                content: (
                  <p>
                    安装官方提供的 Windows 桌面端。原生桌面端使用 Windows
                    用户目录；WSL 中的 ~/.codex 与 Windows 的
                    %USERPROFILE%\.codex
                    不是同一份配置。请在桌面端实际使用的用户目录完成第 3 步。
                  </p>
                ),
              },
              {
                label: 'macOS',
                content: (
                  <p>
                    从官方入口下载适用于当前芯片和系统版本的桌面端。使用同一个
                    macOS 用户时，在 ~/.codex 中合并第 3 步的配置；不要把 CLI
                    的项目目录误当作用户配置目录。
                  </p>
                ),
              },
              {
                label: 'Linux',
                content: (
                  <p>
                    本教程在 Linux 上使用 Codex
                    CLI。桌面端的平台与架构支持范围以官方当前下载页为准；如果未提供对应安装包，请使用
                    CLI，不要安装冒充官方的第三方桌面包。
                  </p>
                ),
              },
            ]}
          />
          <ol className='marker:text-muted-foreground list-decimal pl-5'>
            <li>完全退出桌面端，包括仍在后台运行的进程。</li>
            <li>
              确认用户配置里的
              model_provider、base_url、模型名称与本站令牌一致。
            </li>
            <li>
              重新打开桌面端，选择本地工作目录并创建新会话，检查当前模型及提供商。
            </li>
            <li>
              发送一条简单请求，并在本站日志中核对。若该版本仍要求账号登录或不支持此配置，按该版本官方说明处理，先用
              CLI 验证网关。
            </li>
          </ol>
          <p>
            桌面端的设置入口、平台支持和登录要求可能随版本调整。使用自定义网关前，请核对当前版本的官方说明；API
            Key 配置也不适用于所有云端功能。
          </p>
        </>
      ),
    },
    {
      id: 'verify',
      title: '5. 验证与排查',
      content: (
        <>
          <DocCode title='启动 Codex CLI' code='codex' />
          <p>
            在自己的测试目录中启动，只信任你了解的项目。使用 /status
            检查模型和提供商，再发送“请只回复：连接成功”。真实请求会产生本站用量，请在使用日志中核对。
          </p>
          <ul className='marker:text-muted-foreground list-disc pl-5'>
            <li>
              401 / 403：检查 auth.json
              的令牌值、令牌状态和分组权限，确认未被已有登录状态或环境变量覆盖。
            </li>
            <li>
              404：检查基础地址是否恰好包含一层 /v1，并确认线路支持
              /v1/responses。
            </li>
            <li>
              配置不生效：确认文件路径、TOML 语法、model_provider
              与配置节名称一致，完全重启客户端并新建会话。
            </li>
            <li>
              模型不可用：从本站模型广场复制完整名称；不要直接使用客户端内置的模型列表作为本站支持范围。
            </li>
          </ul>
          <p>
            参考：
            <DocExternalLink href='https://developers.openai.com/codex/config-reference/'>
              Codex 配置参考
            </DocExternalLink>
            、
            <DocExternalLink href='https://developers.openai.com/codex/auth/'>
              身份验证说明
            </DocExternalLink>
            。需要图形化管理时，可继续阅读 CC-Switch 教程。
          </p>
        </>
      ),
    },
  ]
}
