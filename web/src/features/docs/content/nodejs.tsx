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

export const nodejsSections: DocSection[] = [
  {
    id: 'choose-version',
    title: '1. 选择合适的版本',
    content: (
      <>
        <p>
          Node.js 提供 JavaScript 运行环境，npm
          则用于安装命令行工具。请选择官方网站标记为
          LTS（长期支持）的版本；本教程中的 npm 安装方式需要 Node.js 22
          或更高版本。
        </p>
        <p>
          如果已经安装过
          Node.js，可以先运行下面的命令。版本满足要求时，无需重复安装。
        </p>
        <DocCode title='检查现有环境' code={'node -v\nnpm -v'} />
        <DocNotice title='按需安装'>
          Codex、Claude Code 也提供其他安装方式，CC-Switch 自身不要求安装
          Node.js。本篇用于准备 npm 安装方式所需的环境。
        </DocNotice>
      </>
    ),
  },
  {
    id: 'install',
    title: '2. 安装 Node.js',
    content: (
      <DocPlatforms
        items={[
          {
            label: 'Windows',
            content: (
              <>
                <ol className='marker:text-muted-foreground list-decimal pl-5'>
                  <li>
                    打开{' '}
                    <DocExternalLink href='https://nodejs.org/zh-cn/download'>
                      Node.js 官方下载页
                    </DocExternalLink>
                    ，选择 LTS 版本和 Windows 安装包（.msi）。
                  </li>
                  <li>
                    根据电脑处理器选择 x64 或 ARM64，运行安装程序，保留 npm
                    和添加到 PATH 的默认选项。
                  </li>
                  <li>
                    安装完成后关闭原来的终端，重新打开 PowerShell，再验证版本。
                  </li>
                </ol>
                <p>
                  若在 WSL 中运行客户端，应在 WSL 的 Linux 环境里单独安装
                  Node.js，不要混用 Windows 的全局 npm 路径。
                </p>
              </>
            ),
          },
          {
            label: 'macOS',
            content: (
              <>
                <ol className='marker:text-muted-foreground list-decimal pl-5'>
                  <li>
                    打开{' '}
                    <DocExternalLink href='https://nodejs.org/zh-cn/download'>
                      Node.js 官方下载页
                    </DocExternalLink>
                    ，选择 macOS 的 LTS 安装包（.pkg）。
                  </li>
                  <li>
                    根据设备选择 Apple Silicon（ARM64）或
                    Intel（x64），按安装向导完成安装。
                  </li>
                  <li>重新打开“终端”，验证 node 和 npm 是否可用。</li>
                </ol>
                <p>
                  如果已经使用 nvm
                  等版本管理器，继续在原有管理器中安装并切换到受支持的 LTS
                  版本，避免同时维护多套安装。
                </p>
              </>
            ),
          },
          {
            label: 'Linux',
            content: (
              <>
                <p>
                  推荐使用版本管理器安装受支持的 LTS 版本。按{' '}
                  <DocExternalLink href='https://nodejs.org/zh-cn/download'>
                    Node.js 官方下载页
                  </DocExternalLink>{' '}
                  中对应 Linux 的说明安装 nvm；已有 nvm 时运行：
                </p>
                <DocCode
                  title='Linux / nvm'
                  code={
                    'nvm install --lts\nnvm use --lts\nnvm alias default "lts/*"'
                  }
                />
                <p>
                  重新打开终端，确认版本管理器的初始化配置已加载。发行版软件源里的
                  Node.js 可能较旧，安装后仍需检查版本。
                </p>
              </>
            ),
          },
        ]}
      />
    ),
  },
  {
    id: 'verify',
    title: '3. 验证环境',
    content: (
      <>
        <DocCode
          title='验证 Node.js 与 npm'
          code={
            'node -v\nnpm -v\nnode -p "process.platform + \' / \' + process.arch"'
          }
        />
        <p>
          前两条命令应分别输出版本号，最后一条显示系统与处理器架构。环境准备完成后，即可继续阅读
          Codex 或 Claude Code 配置教程。
        </p>
      </>
    ),
  },
  {
    id: 'troubleshooting',
    title: '常见问题',
    content: (
      <dl className='grid gap-4'>
        <div>
          <dt className='font-semibold'>提示找不到 node 或 npm</dt>
          <dd className='text-muted-foreground mt-1'>
            先完全关闭并重新打开终端。Windows 可用 where.exe node
            检查路径；macOS / Linux 可用 command -v
            node。仍找不到时检查安装选项或版本管理器初始化设置。
          </dd>
        </div>
        <div>
          <dt className='font-semibold'>PowerShell 提示 npm.ps1 无法运行</dt>
          <dd className='text-muted-foreground mt-1'>
            可以在 PowerShell 中使用 npm.cmd 替代 npm，例如 npm.cmd
            -v；无需为此关闭系统的脚本安全策略。
          </dd>
        </div>
        <div>
          <dt className='font-semibold'>全局安装提示权限不足</dt>
          <dd className='text-muted-foreground mt-1'>
            优先使用用户级版本管理器，或参照 npm
            官方说明配置用户目录。不要直接给整个系统目录开放写入权限。
          </dd>
        </div>
        <div>
          <dt className='font-semibold'>下载失败或超时</dt>
          <dd className='text-muted-foreground mt-1'>
            确认可以访问 Node.js 官方站点与 npm
            软件源，检查本机网络或代理设置。请勿使用来源不明的安装脚本。
          </dd>
        </div>
      </dl>
    ),
  },
]
