"use client"

import cloudbase from "@cloudbase/js-sdk"

const envId = process.env.NEXT_PUBLIC_TCB_ENV_ID
const clientId = process.env.NEXT_PUBLIC_TCB_CLIENT_ID

let app: ReturnType<typeof cloudbase.init> | null = null

export function getCloudbaseApp() {
  if (!app) {
    if (!envId) {
      throw new Error("缺少 NEXT_PUBLIC_TCB_ENV_ID，请在 .env.local 中配置")
    }
    app = cloudbase.init({
      env: envId,
      region: "ap-shanghai",
      ...(clientId ? { clientId } : {}),
    })
  }
  return app
}

export function getAuth() {
  return getCloudbaseApp().auth({ persistence: "local" })
}
