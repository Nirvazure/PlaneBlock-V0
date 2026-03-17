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

export async function uploadFileToStorage(cloudPath: string, buffer: Buffer): Promise<string> {
  const app = getApp()
  const result = await app.uploadFile({
    cloudPath,
    fileContent: buffer,
  })
  const res = result as { fileID?: string }
  if (!res.fileID) throw new Error("上传失败，未返回 fileID")
  return res.fileID
}

export async function getTempFileURL(fileID: string, maxAgeSeconds = 604800): Promise<string> {
  const app = getApp()
  const result = await app.getTempFileURL({
    fileList: [{ fileID, maxAge: maxAgeSeconds }],
  })
  const res = result as { fileList?: Array<{ tempFileURL?: string }> }
  const item = res.fileList?.[0]
  if (!item?.tempFileURL) throw new Error("获取临时链接失败")
  return item.tempFileURL
}

export async function getTempFileURLBatch(
  fileIDs: string[],
  maxAgeSeconds = 604800
): Promise<Map<string, string>> {
  if (fileIDs.length === 0) return new Map()
  const app = getApp()
  const fileList = fileIDs.map((fileID) => ({ fileID, maxAge: maxAgeSeconds }))
  const result = await app.getTempFileURL({ fileList })
  const res = result as { fileList?: Array<{ fileID?: string; tempFileURL?: string }> }
  const map = new Map<string, string>()
  for (const item of res.fileList ?? []) {
    if (item.fileID && item.tempFileURL) {
      map.set(item.fileID, item.tempFileURL)
    }
  }
  return map
}
