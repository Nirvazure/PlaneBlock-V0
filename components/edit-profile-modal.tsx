"use client"

import { useEffect, useState, useRef } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { processAvatarImage } from "@/lib/avatar-utils"

interface EditProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditProfileModal({ open, onOpenChange, onSuccess }: EditProfileModalProps) {
  const { user, refresh } = useAuth()
  const [nickname, setNickname] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && user) {
      setNickname(user.nickname)
      setAvatarFile(null)
      setPreviewUrl(null)
    }
  }, [open, user])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (file) {
      setAvatarFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setAvatarFile(null)
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("nickname", nickname.trim() || user.nickname)
      if (avatarFile) {
        const processedFile = await processAvatarImage(avatarFile)
        formData.append("avatar", processedFile)
      }

      const res = await fetch("/api/user/profile", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success("资料已更新")
      onOpenChange(false)
      await refresh()
      onSuccess?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "更新失败"
      const isImageError = /图片|canvas|加载/.test(msg)
      toast.error(isImageError ? "图片处理失败，请换一张试试" : msg)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const displayPreview = previewUrl ?? (user.avatar ? user.avatar : null)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-card border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] p-6 shadow-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Dialog.Title className="text-lg font-bold mb-4">编辑资料</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">头像</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted flex items-center justify-center overflow-hidden">
                  {displayPreview ? (
                    <img src={displayPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-muted-foreground">{user.nickname.slice(0, 1)}</span>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    选择图片
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">支持 jpg、png 等，将自动裁剪为 256×256</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                placeholder="输入昵称"
                className="w-full px-3 py-2 border-2 border-[var(--nes-border-dark)] bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">最多 20 个字符</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
