const OUTPUT_SIZE = 256
const JPEG_QUALITY = 0.85

export async function processAvatarImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const canvas = document.createElement("canvas")
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("无法创建 canvas 上下文"))
        return
      }

      const srcSize = Math.min(img.width, img.height)
      const srcX = (img.width - srcSize) / 2
      const srcY = (img.height - srcSize) / 2

      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("图片处理失败"))
            return
          }
          const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
          resolve(new File([blob], name, { type: "image/jpeg" }))
        },
        "image/jpeg",
        JPEG_QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("图片加载失败"))
    }

    img.src = url
  })
}
