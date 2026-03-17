# PlaneBlock

经典纸笔游戏「飞机大战」的 Web 数字版本，支持**本地同屏**与**异地在线**对战。

## 项目概述

PlaneBlock 是一款双人策略对战游戏。两名玩家各自在 10×10 棋盘上布置 3 架飞机，轮流攻击对方坐标，击中机身记「中」，击中机头记「沉」，率先击沉对方全部 3 架飞机者获胜。

## 功能概览

| 功能 | 说明 |
|------|------|
| 手机号登录 | CloudBase 短信验证码，需登录后对战 |
| 本地对战 | `/battle/local`，同屏轮流操作，无需登录 |
| 在线对战 | 创建房间 → 分享房间码 → 好友加入，WebSocket 全实时同步 |
| 好友系统 | 添加好友、好友请求、邀请对战 |
| 技术栈 | Next.js 14、腾讯云 CloudBase（云数据库 + Auth + 后端代理） |

## 路由结构

| 路径 | 说明 |
|------|------|
| `/` | 首页，游戏规则 + 开始对战 |
| `/login` | 手机号验证码登录/注册 |
| `/battle` | 入口：创建房间 / 加入房间 / 本地对战（需登录） |
| `/join` | 输入房间码加入（需登录，昵称从资料获取） |
| `/battle/[roomId]` | 在线对战（需 `?slot=1` 或 `?slot=2`） |
| `/battle/local` | 本地同屏对战 |
| `/profile` | 个人主页（战绩、用户 ID） |

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 后端 | 腾讯云 CloudBase（云数据库 + Node SDK 后端代理） |
| 样式 | Tailwind CSS 4、Radix UI、shadcn/ui |
| 工具 | Zod、react-hook-form、Sonner (Toast) |
| 部署 | Vercel |

## 游戏规则

- **棋盘**：10×10 格子，行列坐标 A–J / 1–10
- **飞机形状**：机头 1 格 + 机翅 5 格（横向）+ 机身 1 格 + 机尾 3 格（横向），共 10 格
- **方向**：每架飞机可朝上、下、左、右四个方向放置
- **阶段**：布置 → 战斗 → 结束
- **攻击**：每次攻击一个坐标；击中机身 = 伤，击中机头 = 沉；击沉后换对方回合
- **胜利**：击沉对方 3 架飞机

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local`，填写：

```
NEXT_PUBLIC_TCB_ENV_ID=你的 CloudBase 环境 ID
TCB_SECRET_ID=腾讯云主账号 SecretId（来自 https://console.cloud.tencent.com/cam/capi）
TCB_SECRET_KEY=腾讯云主账号 SecretKey

# WebSocket 全实时（必填，对战/邀请/好友均依赖实时推送，无轮询）
NEXT_PUBLIC_WS_URL=wss://ws.teotihuacan.cloud
WS_SERVER_SECRET=与 ws-server 共享的密钥
WS_WEBHOOK_URL=https://ws.teotihuacan.cloud
```

### 3. CloudBase 准备

1. [云开发控制台](https://console.cloud.tencent.com/tcb) 开通环境，得到 envId
2. **登录授权**：在控制台 → 登录授权 → 常规登录，启用「短信验证码」
3. 云数据库创建以下集合（选「空集合」即可）：
   - `game_sessions`（对局房间）
   - `profiles`（用户资料）
   - `friends`（好友关系）
   - `friend_requests`（好友请求）
   - `battle_invites`（对战邀请）
4. **集合权限**：全部选择「无权限 [ADMINONLY]」—— 仅后端可访问，安全且符合架构
5. 免费版无法配置安全域名，需使用后端代理（已实现）

#### 云数据库集合说明

| 集合 | 用途 | 主要字段 |
|------|------|----------|
| `game_sessions` | 对局房间 | roomCode、player1UserId、player2UserId、state |
| `profiles` | 用户资料（昵称、头像） | userId、nickname、avatar |
| `friends` | 好友关系（双向） | userId、friendId、status |
| `friend_requests` | 好友请求（待处理） | fromUserId、toUserId、status |
| `battle_invites` | 对战邀请（待处理） | inviterId、inviteeId、roomId、status |

#### 集合权限怎么选

本项目使用 **Next.js 后端代理**，数据库读写都通过服务端 Node SDK（带 SecretId/SecretKey）完成，前端不直连数据库。

**推荐**：选择「无权限 [ADMINONLY]」—— 仅后端可访问，客户端无法直连，安全且符合当前架构。

### 4. 启动

```bash
pnpm dev
```

- **构建**：`pnpm build`
- **部署**：支持 Vercel，需在 Vercel 中配置上述环境变量

## 在线对战流程

1. 双方先完成**手机号登录**（`/login`）
2. 玩家 A：`/battle` → 创建房间 → 得到房间码
3. 玩家 B：`/join` → 输入房间码 → 加入对战（或从好友侧栏「邀请对战」）
4. 双方进入 `/battle/[roomId]`，布置 → 战斗 → 结束
5. 状态通过 **WebSocket** 全实时同步（纯推送，无轮询）

## 好友对战流程

1. 个人主页 (`/profile`) 复制「我的用户 ID」
2. 好友侧栏 → 输入用户 ID 添加好友 → 对方在侧栏接受请求
3. 成为好友后，点击「邀请对战」→ 对方会在顶部收到邀请横幅，点击接受即进入对战

## 技术亮点

### 实时同步方案

本项目采用 **双云架构**：Vercel + CloudBase 负责业务，阿里云轻量部署 WebSocket 服务实现全实时推送。

**核心机制：**
- WebSocket 长连接，房间/邀请/好友变更即时推送
- **同步中 loading**：操作时禁用点击，防止重复提交
- **操作锁**：用户操作时跳过推送拉取，避免冲突
- **深度比较**：只在数据真正变化时更新 UI
- **依赖**：`NEXT_PUBLIC_WS_URL` 必填，未配置或连接失败时会提示错误

**部署说明：** 见 `ws-server/README.md`，需配置子域名 `ws.teotihuacan.cloud` 指向阿里云。

## 后续计划

### 功能
- 随机匹配陌生人
- 战绩排行榜
- 游戏回放

### 优化
- [x] WebSocket 全实时（已实现，需部署 ws-server 到阿里云）

---

*本项目基于 v0.app 生成，后续迭代中。*
