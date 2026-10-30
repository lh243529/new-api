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

export function getClaudeCodeSections(origin: string): DocSection[] {
  return [
    {
      id: 'prepare',
      title: '1. 准备令牌与模型',
      content: (
        <>
          <p>
            先在本站控制台创建 API
            令牌，并在模型广场确认该令牌的分组可以使用哪些支持 Anthropic
            Messages 协议的模型。下文的 YOUR_API_KEY 和 YOUR_CLAUDE_MODEL
            都需要替换。
          </p>
          <DocNotice title='接口地址不要多加路径'>
            本教程的 ANTHROPIC_BASE_URL 使用站点根地址，不要在末尾添加 /v1 或
            /v1/messages。若本站配置了独立 API 域名，请改用控制台公布的地址。
          </DocNotice>
        </>
      ),
    },
    {
      id: 'install',
      title: '2. 安装 Claude Code',
      content: (
        <>
          <p>
            完成 Node.js 环境准备后，运行以下命令。使用 npm 安装时需要 Node.js
            22 或更高版本；官方也提供原生安装方式，详见{' '}
            <DocExternalLink href='https://code.claude.com/docs/en/setup'>
              Claude Code 安装文档
            </DocExternalLink>
            。
          </p>
          <DocCode
            title='安装 Claude Code'
            code={'npm install -g @anthropic-ai/claude-code\nclaude --version'}
          />
          <p>
            Windows 可以从 PowerShell 启动。需要 Bash 工具时安装{' '}
            <DocExternalLink href='https://git-scm.com/downloads/win'>
              Git for Windows
            </DocExternalLink>
            ；使用 WSL 时请把安装与后面的环境配置都放在同一个 WSL 发行版里。
          </p>
        </>
      ),
    },
    {
      id: 'configure',
      title: '3. 设置当前终端的连接信息',
      content: (
        <>
          <p>
            先用临时环境变量验证连接。这些命令只影响当前终端及其启动的客户端，不会修改系统环境变量。请将示例密钥和模型名替换为自己的值，并避免把包含真实密钥的命令分享给他人。
          </p>
          <DocPlatforms
            items={[
              {
                label: 'Windows',
                content: (
                  <DocCode
                    title='PowerShell：Claude Code 配置'
                    code={`$env:ANTHROPIC_BASE_URL = "${origin}"\n$env:ANTHROPIC_AUTH_TOKEN = "YOUR_API_KEY"\nclaude --model "YOUR_CLAUDE_MODEL"`}
                  />
                ),
              },
              {
                label: 'macOS',
                content: (
                  <DocCode
                    title='macOS：Claude Code 配置'
                    code={`export ANTHROPIC_BASE_URL="${origin}"\nexport ANTHROPIC_AUTH_TOKEN="YOUR_API_KEY"\nclaude --model "YOUR_CLAUDE_MODEL"`}
                  />
                ),
              },
              {
                label: 'Linux',
                content: (
                  <>
                    <DocCode
                      title='Linux / WSL：Claude Code 配置'
                      code={`export ANTHROPIC_BASE_URL="${origin}"\nexport ANTHROPIC_AUTH_TOKEN="YOUR_API_KEY"\nclaude --model "YOUR_CLAUDE_MODEL"`}
                    />
                    <p>
                      Git Bash 使用同样的 export 语法；请勿把 PowerShell 的
                      $env: 语法粘贴到 Bash。
                    </p>
                  </>
                ),
              },
            ]}
          />
          <p>
            这里使用 ANTHROPIC_AUTH_TOKEN 发送 Bearer 凭据。若已经配置过
            ANTHROPIC_API_KEY、其他网关凭据或订阅登录，请先检查冲突，确保当前使用的是你选择的网关配置。
          </p>
          <p>
            验证成功后，可以通过 CC-Switch
            管理长期配置，或将环境配置合并到用户设置文件。用户文件位于 macOS /
            Linux 的 ~/.claude/settings.json 或 Windows 的
            %USERPROFILE%\.claude\settings.json。文件中的 env
            值可能覆盖终端变量，请检查已有配置。
          </p>
          <DocCode
            title='用户 settings.json 配置示例'
            code={JSON.stringify(
              {
                env: {
                  ANTHROPIC_BASE_URL: origin,
                  ANTHROPIC_AUTH_TOKEN: 'YOUR_API_KEY',
                },
              },
              null,
              2
            )}
          />
          <DocNotice title='不要把密钥提交到项目'>
            保存前先备份并合并现有内容。不要把凭据写进共享的项目
            .claude/settings.json，也不要将用户配置文件提交到 Git。
          </DocNotice>
        </>
      ),
    },
    {
      id: 'verify',
      title: '4. 检查连接',
      content: (
        <>
          <ol className='marker:text-muted-foreground list-decimal pl-5'>
            <li>在自己的测试项目目录中启动 claude，仅信任你了解的目录。</li>
            <li>
              运行 /status 检查当前使用的模型和连接状态；必要时使用 claude
              doctor 检查安装环境。
            </li>
            <li>
              发送一句简单请求，例如“请只回复：连接成功”，并在本站使用日志中确认请求记录。真实请求会按本站规则计费。
            </li>
          </ol>
          <DocNotice title='模型切换也需要匹配'>
            使用 /model
            或客户端自动选择其他模型时，新模型也必须在令牌可用范围内。需要固定不同模型别名时，参照官方模型配置说明或使用
            CC-Switch 中对应的模型字段。
          </DocNotice>
        </>
      ),
    },
    {
      id: 'troubleshooting',
      title: '常见问题与参考资料',
      content: (
        <>
          <ul className='marker:text-muted-foreground list-disc pl-5'>
            <li>
              401 / 403：检查令牌是否正确、已启用，以及分组和模型权限；不要把
              ChatGPT 或 Claude 的订阅凭据当成本站 API 令牌。
            </li>
            <li>
              404：确认使用根地址，并确认所选模型和线路支持 Messages 接口。
            </li>
            <li>
              模型不可用：从模型广场复制完整名称，检查是否有旧设置覆盖了模型选择。
            </li>
            <li>
              新终端恢复默认连接：临时环境变量没有被保存，重新设置或使用
              CC-Switch 管理配置。
            </li>
          </ul>
          <p>
            参考：
            <DocExternalLink href='https://code.claude.com/docs/en/llm-gateway-connect'>
              Claude Code 网关接入
            </DocExternalLink>
            、
            <DocExternalLink href='https://code.claude.com/docs/en/model-config'>
              模型配置
            </DocExternalLink>
            。
          </p>
        </>
      ),
    },
  ]
}
