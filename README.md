# PlaneBlock

经典纸笔游戏「飞机大战」的 Web 数字版本。

## 项目概述

PlaneBlock 是一款双人策略对战游戏，源自经典的纸笔飞机大战玩法。两名玩家各自在 10×10 棋盘上布置 3 架飞机，轮流攻击对方坐标，击中机身记「中」，击中机头记「沉」，率先击沉对方全部 3 架飞机者获胜。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4、Radix UI、shadcn/ui |
| 工具 | Zod、react-hook-form、Sonner (Toast) |
| 部署 | Vercel |

## 目录结构

```
├── app/
│   ├── globals.css    # 全局样式与游戏主题变量
│   ├── layout.tsx     # 根布局
│   └── page.tsx       # 主页面（游戏逻辑）
├── components/
│   ├── ui/            # shadcn/ui 基础组件
│   ├── game-board.tsx # 棋盘组件
│   ├── game-setup.tsx # 布置阶段
│   └── game-status.tsx# 对战状态
├── lib/
│   └── utils.ts       # 工具函数 (cn)
├── public/            # 静态资源
└── package.json
```

## 游戏规则

- **棋盘**：10×10 格子，行列坐标 A–J / 1–10
- **飞机形状**：机头 1 格 + 机翅 5 格（横向）+ 机身 1 格 + 机尾 3 格（横向），共 10 格
- **方向**：每架飞机可朝上、下、左、右四个方向放置
- **阶段**：布置 → 战斗 → 结束
- **攻击**：每次攻击一个坐标；击中机身 = 伤，击中机头 = 沉；击沉后换对方回合
- **胜利**：击沉对方 3 架飞机

## 已知问题与后续优化方向

| 类型 | 描述 |
|------|------|
| 结构 | 游戏状态集中在 `page.tsx`，可抽离为 `useGameState` 或 reducer |
| 体验 | 本地同屏对战；可考虑联机对战、人机对战 |
| 规范 | `next.config.mjs` 中 `ignoreDuringBuilds` / `ignoreBuildErrors` 为 true，建议逐步修复并启用 |

## 开发与部署

```bash
pnpm install
pnpm dev
```

- **构建**：`pnpm build`
- **部署**：支持 Vercel 等平台

---

*本项目基于 v0.app 生成，可作为后续迭代的基础版本。*
