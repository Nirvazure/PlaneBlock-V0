"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { HomeRules } from "@/components/home/HomeRules"
import { HomeBattleActions } from "@/components/home/HomeBattleActions"
import { HomeFooter } from "@/components/home/HomeFooter"

export default function GuidePage() {
  const { user, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0 bg-[#1e1e1e]">
        <p className="text-muted-foreground text-lg">加载中...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col min-h-0 h-0 bg-[#1e1e1e]">
        <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-4">
          <Card className="max-w-6xl w-full p-6 md:p-8 rounded-none border-0 bg-[#1e1e1e]">
            <div className="max-w-2xl mx-auto">
              <HomeRules />
              <div className="flex justify-center mt-6">
                <Button asChild size="lg" className="h-10 text-sm px-6">
                  <Link href="/login">去登录</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
        <HomeFooter />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 h-0 bg-[#1e1e1e]">
      <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-4">
        <Card className="max-w-6xl w-full p-6 md:p-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 rounded-none border-0 bg-[#1e1e1e]">
          <div className="flex-1 min-w-0 w-full md:max-w-xl">
            <HomeRules align="left" />
          </div>
          <div className="flex-1 flex flex-col items-center md:items-start shrink-0 w-full md:max-w-sm">
            <HomeBattleActions />
          </div>
        </Card>
      </div>
      <HomeFooter />
    </div>
  )
}
