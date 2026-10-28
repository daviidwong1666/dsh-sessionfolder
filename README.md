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

## 依赖与冲突

### 运行时依赖

- 代码里只有一处 `require`：`require('react')`，由宿主的 ModuleLoader 提供。没有
  `dependencies` / `peerDependencies` / `devDependencies`，不锁任何版本，安装时不会拉包。
- 依赖的 Host Client 能力（在 DSH **0.2.1-rc.3** 上实测）：client 服务 `slots`、`locale`、
  `sessions`、`uiWorkspace`、`workspaces`；以及 `sidebar.workspaces` 槽位——它由
  `@deepseek-ai/dsh-client-ui-workspace` 声明，所以 `dsh.client.inject` 里写了这个包名，
  保证我的条目注册之前声明方已经在位（`sidebar.workspaces` 一旦没人声明，注册会直接抛错）。
- 安装 pnpm 报的 `Issues with peer dependencies found` 来自 profile 里其它插件，与本包无关。
- 兼容性没有版本闸门：槽位契约若在下个 DSH 版本变动（槽位名、ownerProps、注入面），
  需要跟着改 `client.js`。这是一次性的前端阴影插件，不保证跨大版本可用。

### 与其它插件的冲突面

按「可能踩到」的严重程度排：

1. **同样是接管 `sidebar.workspaces` 的插件**。这个槽位是 `single`，只渲染一个条目：
   按 `priority` 升序取第一个未 abdicate 的。本插件是 `-1`，宿主是 `0`。所以两个接管型
   插件同时装只会显示优先级更低的那一个，**不会两套列表叠加**；本插件赢了就意味着
   对方的浏览器整块不出现（对方的槽位条目仍在账本里，`active: false`）。
   已知的另一个接管者：`@michengai/dsh-archive-manager`（1.0.18）在「宿主没有声明
   会话菜单子槽」时用 `priority: -0.5` 自建浏览器。
2. **往那 5 个子槽注册条目的插件**（`sidebar.workspaces.session.menu.item`、
   `.session.row.action`、`.directoryFlow`、`sidebar.session.row.leading`、
   `sidebar.session.row.hover`）。这些子槽由宿主声明，本插件只接管父槽、**不渲染它们**。
   典型模式：`@michengai/dsh-archive-manager` 检测到宿主声明了菜单子槽后，会改为注册
   `archive-manager.delete-session`（`order: 500`，会话菜单里的「删除会话」）。这类条目在
   宿主原生列表里正常出现，**在本插件接管期间不会显示**，因为我的会话菜单只渲染自己的条目。
   要用它就先临时禁用本插件。
   （实测：本机 profile 里该包是依赖但不在 `dsh.profile.bundles` 中，当前未加载，
   所以这条是代码路径层面的冲突面，不是此刻正在发生的冲突。）
3. **`dsh-better-sidebar`（0.26.0）**：只碰 `conversation.session.header.utilities`、
   `settings.section`、`sidebar.right.pane.tab` / `.title`，与本插件无交集。
   它那条 `pending (waiting for service: webRuntime)` 是它自己的状态，与本插件无关。
4. **`shell.overlay`**：本插件是追加式条目（`id: session-folders-dialog`、`order: 600`），
   与 dsh-market 等同样往这层加东西的插件不冲突——浮层按 `order` 叠，互不遮挡对方的触发器。

## 已知限制

- 置顶（pin）没有界面上手（数据层支持排序，但菜单没暴露）。
- 会话拖拽排序（手动顺序）没有实现，顺序只由更新时间决定。
- 只影响当前浏览器；多设备之间不共享文件夹结构。
- 其它插件注册到「会话行子槽」的条目在本插件接管期间不显示（详见上一节第 2 条）。
- 会话菜单只覆盖本插件自己实现的动作；宿主原生的 `session.menu.item` 条目（pin、rename
  等由宿主注册、id 为 `pin`/`rename`/`fork`/`archive`/`session-id` 的五个）同样不渲染。

## 开发

```powershell
node --check client.js                     # 语法
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"
```

`client.js` 是单文件、无构建步骤：`window.__ModuleLoader__.load({ id, factory })`
里只 `require('react')`，不引入任何 Harness Client 包。

## 许可

MIT，见 [LICENSE](LICENSE)。
