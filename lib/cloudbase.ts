import tcb from "@cloudbase/node-sdk"

const envId = process.env.NEXT_PUBLIC_TCB_ENV_ID
const secretId = process.env.TCB_SECRET_ID
const secretKey = process.env.TCB_SECRET_KEY

function getApp() {
  if (!envId) {
    throw new Error(
      "缺少 NEXT_PUBLIC_TCB_ENV_ID。本地：.env.local；Vercel：Settings → Environment Variables"
    )
  }
  if (!secretId || !secretKey) {
    throw new Error(
      "缺少 TCB_SECRET_ID 或 TCB_SECRET_KEY。获取：腾讯云控制台 → 访问管理 → API密钥管理 (https://console.cloud.tencent.com/cam/capi)。本地：.env.local；Vercel：Settings → Environment Variables"
    )
  }
  return tcb.init({
    env: envId,
    secretId,
    secretKey,
    // Vercel 海外 → 腾讯云中国 跨境连接易超时，延长至 30s
    timeout: 30000,
  })
}

export function getDb() {
  return getApp().database()
}
