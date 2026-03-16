# PlaneBlock

经典纸笔游戏「飞机大战」的 Web 数字版本，支持**本地同屏**与**异地在线**对战。

## 项目概述

PlaneBlock 是一款双人策略对战游戏。两名玩家各自在 10×10 棋盘上布置 3 架飞机，轮流攻击对方坐标，击中机身记「中」，击中机头记「沉」，率先击沉对方全部 3 架飞机者获胜。

## 功能概览

| 功能 | 说明 |
|------|------|
| 本地对战 | `/battle/local`，同屏轮流操作 |
| 在线对战 | 创建房间 → 分享房间码 → 好友加入，异地实时同步 |
| 技术栈 | Next.js 14、腾讯云 CloudBase（后端代理 + 2 秒轮询） |

## 路由结构

| 路径 | 说明 |
|------|------|
| `/` | 首页，游戏规则 + 开始对战 |
| `/battle` | 入口：创建房间 / 加入房间 / 本地对战 |
| `/join` | 输入房间码 + 昵称加入 |
| `/battle/[roomId]` | 在线对战（需 `?slot=1` 或 `?slot=2`） |
| `/battle/local` | 本地同屏对战 |
| `/profile` | 个人主页（mock 战绩） |

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
```

### 3. CloudBase 准备

1. [云开发控制台](https://console.cloud.tencent.com/tcb) 开通环境，得到 envId
2. 云数据库创建集合 `game_sessions`
3. 集合权限：建议「自定义安全规则」`read: true, write: true`（Demo 用）
4. 免费版无法配置安全域名，需使用后端代理（已实现）

### 4. 启动

```bash
pnpm dev
```

- **构建**：`pnpm build`
- **部署**：支持 Vercel，需在 Vercel 中配置上述环境变量

## 在线对战流程

1. 玩家 A：`/battle` → 输入昵称 →「创建房间」→ 得到房间码
2. 玩家 B：`/join` → 输入房间码 + 昵称 →「加入对战」
3. 双方进入 `/battle/[roomId]`，布置 → 战斗 → 结束
4. 状态通过 API 轮询（约 2 秒）同步

## 后续计划

- 用户登录/注册
- 随机匹配陌生人
- 战绩持久化与好友系统
- 付费版 CloudBase 后可接入 `watch()` 真实时，替代轮询

---

*本项目基于 v0.app 生成，后续迭代中。*
