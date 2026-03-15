# PlaneBlock 功能实现计划

## 一、改动范围与难度分析

| 模块 | 改动范围 | 难度 | 涉及文件 |
|------|----------|------|----------|
| 游戏类型抽离 | 小 | 易 | 新建 lib/game-types.ts，修改 4 个引用 |
| 路由 restructuring | 中 | 易 | 新建 app/battle/、app/profile/，修改 app/page.tsx |
| 顶部栏组件 | 小 | 易 | 新建 components/top-bar.tsx |
| 好友侧边栏 | 小 | 易 | 新建 components/friend-sidebar.tsx，需 vaul Drawer |
| 布局整合 | 小 | 易 | 修改 app/layout.tsx |
| 街机复古主题 | 小 | 易 | 修改 app/globals.css，可选添加字体 |

**总难度**：易 | **原则**：最小化改动，保持现有对战逻辑零变更

---

## 二、技术规格

### 2.1 游戏类型抽离

**目的**：对战页移至 `/battle` 后，`game-setup`、`game-board`、`game-status` 需从统一位置导入类型。

**新建** `lib/game-types.ts`：
- 导出：`GamePhase`、`CellState`、`Direction`、`Airplane`、`GameState`、`initialBoard`
- 内容：从 `app/page.tsx` 原样迁移（第 11-42 行）

**修改引用**：
- `components/game-setup.tsx`：`import type { ... } from "@/app/page"` → `from "@/lib/game-types"`
- `components/game-board.tsx`：同上
- `components/game-status.tsx`：同上
- `app/battle/page.tsx`（新建）：`from "@/lib/game-types"`

---

### 2.2 路由结构

| 路由 | 文件路径 | 内容 |
|------|----------|------|
| `/` | `app/page.tsx` | 引导页：游戏规则介绍 |
| `/battle` | `app/battle/page.tsx` | 对战页：当前完整对战逻辑 |
| `/profile` | `app/profile/page.tsx` | 个人主页：mock 战绩 |

**app/page.tsx**（引导页）：
- 移除所有游戏相关 state 和组件
- 内容：PlaneBlock 标题、简要规则说明、CTA 按钮「开始对战」链接到 `/battle`
- 布局：居中卡片式，简洁

**app/battle/page.tsx**（新建）：
- 从当前 `app/page.tsx` 完整迁移对战逻辑（第 44-216 行）
-  imports：`@/lib/game-types`、`@/components/*`
- 移除顶部「飞机大战 / 经典纸笔... / 当前阶段」区块（由 TopBar 替代）
- 保留：「重新开始」按钮、GameStatus、双列布局（GameSetup / GameBoard）

---

### 2.3 顶部栏 TopBar

**新建** `components/top-bar.tsx`：
- 布局：`flex justify-between items-center`，固定顶部，`h-14` 或 `h-16`，`bg-card`，`border-b`
- 左侧：可点击区域，含「PlaneBlock」文字（或占位 Logo），点击 `Link` 到 `/`
- 右侧：两个可点击元素
  1. 「我的好友」按钮 → 打开好友侧边栏（通过 props 或 context 控制）
  2. 用户头像区 → 未登录时显示默认占位头像，点击 `Link` 到 `/profile`
- Props：`onOpenFriends?: () => void` 或使用 React state 共享
- 用户状态：当前阶段使用 mock，`{ nickname: "游客", avatar: null }`，结构便于后续接入 Authing

**实现方式**：TopBar 与 FriendSidebar 通过 `LayoutClient` 包裹，用 `useState` 管理侧边栏开关。

---

### 2.4 好友侧边栏 FriendSidebar

**新建** `components/friend-sidebar.tsx`：
- 使用 `vaul` 的 `Drawer`，`direction="right"`
- Props：`open: boolean`、`onOpenChange: (open: boolean) => void`
- 内容：标题「我的好友」，下方 mock 好友列表
- Mock 数据：3-5 条，每项含 `avatar`、`nickname`、`status`（在线/离线）
- 样式：宽约 `w-80`，深色背景与主题一致，列表项可 hover

---

### 2.5 布局整合

**修改** `app/layout.tsx`：
- 将 `children` 包裹在 `LayoutClient` 内，或直接在此使用 client component
- 结构：`<TopBar onOpenFriends={...} />` + ` FriendSidebar` + `{children}`
- 由于 TopBar 需要控制 Drawer，需一个 client wrapper：新建 `components/layout-client.tsx`

**新建** `components/layout-client.tsx`：
- `"use client"`
- state：`friendsOpen: boolean`
- 渲染：`<TopBar onOpenFriends={() => setFriendsOpen(true)} ... />` + `FriendSidebar open={friendsOpen} onOpenChange={setFriendsOpen}` + `{children}`
- 将 `Toaster` 保留在 `layout.tsx` 或移入此处（layout 需保留 Toaster）

**修改** `app/layout.tsx`：
- 引入 `LayoutClient`，`<body><LayoutClient>{children}</LayoutClient><Toaster />...</body>`

---

### 2.6 街机复古主题

**修改** `app/globals.css`：
- 在 `:root` 中覆盖以下变量为 retro arcade 风格：
  - `--background`: 深色 `oklch(0.12 0.02 280)` 或 `#0d0d14`
  - `--foreground`: `oklch(0.95 0 0)`
  - `--primary`: 霓虹粉 `oklch(0.7 0.25 330)` 或 `#ff00ff` 对应 oklch
  - `--accent`: 霓虹青 `oklch(0.75 0.18 195)` 或 `#00ffff` 对应
  - `--card`、`--muted`：略浅于 background 的深色
- 可选：添加 `@import` 引入 Google Font "Press Start 2P" 用于标题，或保持 Geist 仅改色

---

### 2.7 个人主页 Mock

**新建** `app/profile/page.tsx`：
- 简单居中布局
- 标题「个人主页」
- 战绩区域 mock：胜场、负场、胜率（例如 12胜 / 8负 / 60%）
- 使用 Card 包裹，风格与主题一致

---

### 2.8 对战页顶部区域移除

**app/battle/page.tsx** 中删除原 page.tsx 的：
```tsx
<div className="text-center mb-8">
  <h1 className="...">飞机大战</h1>
  <p className="...">经典纸笔游戏的数字版本</p>
  <div className="mt-4 p-2 bg-card ...">
    <p>当前阶段: ...</p>
  </div>
</div>
```
仅保留「重新开始」按钮、GameStatus 及下方 grid 内容。

---

## 三、文件变更清单

| 操作 | 路径 |
|------|------|
| 新建 | `lib/game-types.ts` |
| 新建 | `app/battle/page.tsx` |
| 新建 | `app/profile/page.tsx` |
| 新建 | `components/top-bar.tsx` |
| 新建 | `components/friend-sidebar.tsx` |
| 新建 | `components/layout-client.tsx` |
| 修改 | `app/page.tsx`（改为引导页） |
| 修改 | `app/layout.tsx`（接入 LayoutClient） |
| 修改 | `app/globals.css`（retro 主题） |
| 修改 | `components/game-setup.tsx`（类型 import） |
| 修改 | `components/game-board.tsx`（类型 import） |
| 修改 | `components/game-status.tsx`（类型 import） |

**需要安装**：无（vaul 已存在）。若使用 Press Start 2P 字体，通过 `next/font/google` 或 CSS `@import` 引入。

---

## 四、IMPLEMENTATION CHECKLIST

1. 新建 `lib/game-types.ts`，将 `GamePhase`、`CellState`、`Direction`、`Airplane`、`GameState`、`initialBoard` 从 `app/page.tsx` 迁移过去
2. 修改 `components/game-setup.tsx`，将类型 import 从 `@/app/page` 改为 `@/lib/game-types`
3. 修改 `components/game-board.tsx`，将类型 import 从 `@/app/page` 改为 `@/lib/game-types`
4. 修改 `components/game-status.tsx`，将类型 import 从 `@/app/page` 改为 `@/lib/game-types`
5. 新建 `app/battle/page.tsx`，从当前 `app/page.tsx` 迁移完整对战逻辑，移除顶部「飞机大战/经典纸笔/当前阶段」区块，import 类型从 `@/lib/game-types`
6. 重写 `app/page.tsx` 为引导页：标题、规则说明、「开始对战」Link 到 `/battle`
7. 新建 `components/top-bar.tsx`：左侧 Logo+标题 Link 到 `/`，右侧「我的好友」按钮和头像 Link 到 `/profile`，使用 mock 用户数据
8. 新建 `components/friend-sidebar.tsx`：使用 vaul Drawer `direction="right"`，mock 好友列表 3-5 条
9. 新建 `components/layout-client.tsx`：管理 friendsOpen state，渲染 TopBar、FriendSidebar、children
10. 修改 `app/layout.tsx`：用 LayoutClient 包裹 children
11. 修改 `app/globals.css`：应用 retro arcade 主题色（background、primary、accent 等）
12. 新建 `app/profile/page.tsx`：个人主页 mock，展示 mock 战绩（胜/负/胜率）
