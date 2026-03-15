"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8">
        <h1 className="text-xl font-bold text-center mb-6">PlaneBlock</h1>
        <p className="text-muted-foreground text-center mb-8 text-xs">经典纸笔飞机大战的数字版本</p>

        <div className="space-y-4 mb-8">
          <h2 className="text-sm font-bold">游戏规则</h2>
          <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
            <li>双方在 10×10 棋盘上各放置 3 架飞机（每架 4 格：1 机头 + 3 机身）</li>
            <li>布置阶段：轮流选择方向与位置放置飞机</li>
            <li>战斗阶段：轮流点击对手棋盘格子进行攻击</li>
            <li>击中机头可击毁整架飞机，率先击毁对方 3 架飞机者获胜</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/battle">开始对战</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
