"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getAuth } from "@/lib/cloudbase-client"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [verificationId, setVerificationId] = useState<string | null>(null)
  const [isUser, setIsUser] = useState(false)
  const [loading, setLoading] = useState(false)

  const formatPhone = (v: string) => {
    const digits = v.replace(/\D/g, "")
    if (digits.length <= 11) return digits
    return digits.slice(0, 11)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const digits = formatPhone(phone)
    if (digits.length !== 11) {
      toast.error("请输入正确的 11 位手机号")
      return
    }
    const phoneNumber = `+86 ${digits}`
    setLoading(true)
    try {
      const auth = getAuth()
      const res = await auth.getVerification({
        phone_number: phoneNumber,
      } as Parameters<typeof auth.getVerification>[0])
      const v = res as { verification_id?: string; is_user?: boolean }
      setVerificationId(v.verification_id ?? null)
      setIsUser(v.is_user ?? false)
      setStep("code")
      toast.success("验证码已发送")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "发送验证码失败")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || code.length !== 6 || !verificationId) {
      toast.error("请输入 6 位验证码")
      return
    }
    const digits = formatPhone(phone)
    const phoneNumber = `+86 ${digits}`
    setLoading(true)
    try {
      const auth = getAuth()
      await auth.signInWithSms({
        phoneNum: phoneNumber,
        verificationCode: code.trim(),
        verificationInfo: { verification_id: verificationId, is_user: isUser },
      } as Parameters<typeof auth.signInWithSms>[0])
      const tokenRes = await auth.getAccessToken()
      const userRes = await auth.getCurrentUser()
      const user = userRes ?? undefined
      const userId = user?.uid ?? (user as { id?: string })?.id ?? ""
      const nickname = (user as { name?: string })?.name ?? (user as { username?: string })?.username ?? `用户${digits.slice(-4)}`

      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: tokenRes.accessToken,
          userId,
          nickname,
        }),
        credentials: "include",
      })

      await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
        credentials: "include",
      })

      toast.success("登录成功")
      router.push("/")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "登录失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-sm w-full p-6">
        <h1 className="text-lg font-bold text-center mb-6">
          {step === "phone" ? "手机号登录" : "输入验证码"}
        </h1>
        {step === "phone" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">手机号</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="138xxxxxxxx"
                maxLength={11}
                className="w-full px-3 py-2 border-2 border-[var(--nes-border-dark)] bg-background text-sm"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "发送中..." : "获取验证码"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-xs text-muted-foreground">
              已向 {phone ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : ""} 发送验证码
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">验证码</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6 位数字"
                maxLength={6}
                className="w-full px-3 py-2 border-2 border-[var(--nes-border-dark)] bg-background text-sm"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "验证中..." : "登录"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep("phone")
                setCode("")
                setVerificationId(null)
              }}
              className="w-full text-xs text-muted-foreground hover:underline"
            >
              更换手机号
            </button>
          </form>
        )}
        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:underline">
            返回首页
          </Link>
        </p>
      </Card>
    </div>
  )
}
