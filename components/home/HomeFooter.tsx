"use client"

export function HomeFooter() {
  return (
    <footer className="shrink-0 border-t-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted/50 py-4 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">YQYMONs STUDIO</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">YQYMONs游戏工作室</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          <span>像素美术 / 主设：NIRVAZURE</span>
          <span>程序开发：NIRVAZURE</span>
        </div>
        <div className="text-xs opacity-80">
          © 2026 YQYMONs GROUP · PlaneBlock
        </div>
      </div>
    </footer>
  )
}
