# 首页合并 + 组件拆分 — 详细技术规格

## 1. 新建 `components/home/HomeRules.tsx`

- **职责**：展示 logo、标题、游戏规则（纯展示，无状态）
- **内容**：从 `app/page.tsx` 提取的规则区域
- **导出**：默认导出 `HomeRules` 组件
- **结构**：
  - `<img src="/planeBlock.png" ... />`（max-w-[200px] w-48 mx-auto mb-6）
  - `<h1>PlaneBlock</h1>`（text-xl font-bold text-center mb-6）
  - `<div className="space-y-4">` 包含 h2「游戏规则」和 ul 规则列表
- **不包含**：按钮（按钮在 page 或 HomeBattleActions 中）

---

## 2. 新建 `components/home/HomeBattleActions.tsx`

- **职责**：头像、昵称、三个对战按钮（创建房间 / 加入房间 / 本地对战）
- **依赖**：`useAuth`、`createRoom`、`createRoom`、`router.push`、`Link`
- **Props**：无，内部使用 `useAuth()` 获取 `user`
- **逻辑**：
  - `handleCreateRoom`：与当前 `app/battle/page.tsx` 中逻辑一致
  - 调用 `createRoom(user.nickname)`，成功后 `router.push(\`/battle/${roomId}?slot=1\`)`
- **UI**：
  - 头像：w-12 h-12，NES 边框样式，与 battle page 一致
  - 昵称：font-medium text-sm truncate
  - 三个按钮：创建房间、加入房间（Link /join）、本地对战（Link /battle/local）
- **不包含**：「返回首页」链接（放在 page 层统一处理）

---

## 3. 修改 `app/page.tsx`

- **新增导入**：`useAuth`、`HomeRules`、`HomeBattleActions`、`Link`（若尚未导入）
- **布局**：
  - **未登录**：单 Card，内为 `HomeRules` + 底部「去登录」Button（Link `/login`）
  - **已登录**：
    - 桌面端：`flex flex-col md:flex-row`，左侧 `HomeRules`（flex-1 或合理占比），右侧 `HomeBattleActions`（flex-1），中间 gap
    - 移动端：垂直排列，`HomeRules` 在上，`HomeBattleActions` 在下
  - 统一：min-h-screen、flex、items-center、justify-center、p-6
- **加载态**：`authLoading` 时显示「加载中...」（与 battle page 一致）
- **Card 使用**：
  - 未登录：单 Card 包裹规则 + 去登录
  - 已登录：可用一个 Card 包裹左右两栏，或两栏各用一个 Card（选一种，建议单 Card 双栏）

---

## 4. 删除 `app/battle/page.tsx`

- 整个文件删除
- 路由 `/battle` 将 404，所有入口已改为 `/`

---

## 5. 修改 `app/join/page.tsx`

- 第 55 行：`href="/battle"` → `href="/"`
- 第 83 行：`href="/battle"` → `href="/"`
- 两处「返回」链接均指向首页

---

## 6. 无需修改的文件

- `components/top-bar.tsx`：`pathname?.startsWith("/battle")` 用于隐藏 TopBar 在 /battle/[roomId]、/battle/local，逻辑正确
- `components/invites-banner.tsx`：同上
- `app/battle/[roomId]/page.tsx`、`app/battle/local/page.tsx`：保留不变

---

## IMPLEMENTATION CHECKLIST

1. 新建 `components/home/HomeRules.tsx`，实现 logo + 标题 + 规则区域（无按钮）
2. 新建 `components/home/HomeBattleActions.tsx`，实现头像 + 昵称 + 创建/加入/本地三个按钮
3. 修改 `app/page.tsx`：引入 useAuth、HomeRules、HomeBattleActions；实现加载态、未登录（规则+去登录）、已登录（桌面左右/移动上下）布局
4. 删除 `app/battle/page.tsx`
5. 修改 `app/join/page.tsx`：两处 `href="/battle"` 改为 `href="/"`
