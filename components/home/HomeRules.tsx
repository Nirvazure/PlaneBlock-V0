"use client"

interface HomeRulesProps {
  align?: "center" | "left"
}

export function HomeRules({ align = "center" }: HomeRulesProps) {
  const isCenter = align === "center"
  return (
    <>
      <img
        src="/planeBlock.png"
        alt="PlaneBlock"
        className={`max-w-[180px] w-44 mb-4 ${isCenter ? "mx-auto" : "mx-auto md:mx-0 md:mr-auto"}`}
      />
      <h1 className={`text-2xl font-bold mb-4 ${isCenter ? "text-center" : "md:text-left"}`}>
        PlaneBlock
      </h1>
      <div className="space-y-3">
        <h2 className="text-base font-bold">游戏规则</h2>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
          <li>双方在 10×10 棋盘上各放置 3 架飞机（每架 4 格：1 机头 + 3 机身）</li>
          <li>布置阶段：轮流选择方向与位置放置飞机</li>
          <li>战斗阶段：轮流点击对手棋盘格子进行攻击</li>
          <li>击中机头可击毁整架飞机，率先击毁对方 3 架飞机者获胜</li>
        </ul>
      </div>
    </>
  )
}
