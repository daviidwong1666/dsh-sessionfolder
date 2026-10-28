# dsh-session-folders

Sidebar session folders for the DeepSeek Harness Web UI: file each workspace's
sessions into collapsible, color-coded folders — **presentation only**, no Host
data is written.

> 把左侧侧边栏里「工作区会话」做成可展开/收起的文件夹。纯前端插件，只改展示，不碰 Host 数据。

## 它是什么，不是什么

- 是：一个 DSH **client** 插件，接管侧边栏的会话浏览区（`sidebar.workspaces` 槽位），
  自己渲染工作区分组 + 文件夹块 + 会话行。
- 不是：不是会话存储、不是 Host 侧功能。文件夹结构只存在浏览器 `localStorage`，
  换浏览器/清缓存就没了；不影响 Agent 行为、不影响会话本身。

## 安装

```powershell
# 在 DSH 的插件管理器里按目录安装（本仓库根目录就是这个包）
plugin_manager install_bundle target="<本仓库绝对路径>"
```

或在 Web UI 的 Plugins 里选择「从本地目录安装」。安装后需要刷新页面。
`package.json` 里的 `dsh.bundle.patch` 会把包插进 profile 的 patch 层，`dsh.client`
声明它是 Web 端 client 插件并注入 `@deepseek-ai/dsh-client-ui-workspace`。

开发时改 `client.js` 后**刷新页面即生效**（profile 里是 `link:`，无需重装）。

## 用法

| 操作 | 怎么做 |
|---|---|
| 把会话放进文件夹 | 会话行悬停 → 右侧「…」→「加入文件夹」→ 选目标文件夹（子页里也能「新建文件夹…」）；或直接把会话行拖到文件夹行上 |
| 移出文件夹 | 会话行「…」→「移出文件夹」；或把会话拖到工作区分组头上 |
| 新建文件夹 | 会话「…」→「加入文件夹」→「新建文件夹…」，或工作区分组头悬停时的「＋」 |
| 重命名文件夹 | 文件夹行「…」→「重命名…」 |
| 换颜色 | 文件夹行「…」→「颜色」→ 9 色任选 |
| 展开/收起文件夹 | 点文件夹行本身；折叠状态会持久化 |
| 搜索 | 标题栏下方的搜索框，按会话名/工作区名/文件夹名即时过滤 |
| 归档会话 | 会话「…」→「归档」；默认仍显示已归档会话（淡色 +「已归档」标注），可在视图选项里隐藏 |

### 排序规则

每个工作区内部，松散会话与文件夹混排：

1. 置顶（pinned）优先；
2. 其次按「更新时间」倒序——会话用自身 `updatedAt`；**文件夹用其成员里最新的 `updatedAt`**，
   于是收纳后整个文件夹会跟着最新成员一起上浮；空文件夹排最后；
3. 仍相同则按会话 id / 文件夹创建顺序。

文件夹不跨工作区：`A` 工作区的会话只能进 `A` 工作区的文件夹，归属在建模时逐组校验。

## 数据与持久化

`localStorage` 键 `dsh.session-folders.v1`：

```jsonc
{
  "version": 2,
  "folders":  { "<workspaceId>": [{ "id": "f…", "name": "写作", "color": "blue", "collapsed": false }] },
  "assign":   { "<sessionId>": "<folderId>" },
  "collapsed":{ "<groupKey>": true },   // 工作区分组的折叠状态
  "showArchived": true
}
```

`version: 1` 的数据在首次加载时自动升级：v1 默认隐藏已归档会话，这不算用户选择，
所以升级时统一改回「显示」。文件夹数据不丢。

## 搜索的现状

- **名称匹配**（会话标题、工作区名、文件夹名）在本地即时完成，不需要网络。
- **内容检索**依赖 Host 的会话查询索引。DSH 默认把该索引配置成 `openAt: "never"`，
  此时 `sessions.search` 会返回 `SessionQueryError: session search is disabled`。
  插件第一次探测失败后会在本页内静默降级，只用名称匹配；索引可用时内容命中会
  自动并入结果并显示片段。

## 与宿主侧边栏的关系

- 注册为 `sidebar.workspaces` 的条目，`priority: -1`——单槽位按 priority 升序取首个
  未 abdicate 的条目，`-1` 才能盖住宿主默认的 `0`。宿主条目因此处于 `active: false`。
- 不声明该槽位的子槽（`session.menu.item`、`row.action`、`directoryFlow`、
  `session.row.leading`、`row.hover`）——子槽只能有一个声明者，抢声明会抛错。
  代价是宿主自带的置顶/重命名/分叉/归档菜单条目虽仍在账本里，但不会渲染，
  这些动作由本插件自己的行菜单提供。
- 条目崩溃时会自动 abdicate，此时宿主原生浏览器接手渲染，等于天然兜底。
- 样式只引用 `--dsw-alias-*` 主题 token，取不到时回落到另一个主题 token
  （例如 `var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2))`），
  不写死颜色——唯一例外是 9 个文件夹色块。

## 已知限制

- 置顶（pin）没有界面上手（数据层支持排序，但菜单没暴露）。
- 会话拖拽排序（手动顺序）没有实现，顺序只由更新时间决定。
- 只影响当前浏览器；多设备之间不共享文件夹结构。

## 开发

```powershell
node --check client.js                     # 语法
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"
```

`client.js` 是单文件、无构建步骤：`window.__ModuleLoader__.load({ id, factory })`
里只 `require('react')`，不引入任何 Harness Client 包。
