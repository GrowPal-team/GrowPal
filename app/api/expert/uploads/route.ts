import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

function extensionFor(contentType: string): string {
  if (contentType === "image/png") return ".png"
  if (contentType === "image/webp") return ".webp"
  if (contentType === "image/gif") return ".gif"
  return ".jpg"
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only image uploads are supported" }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Image must be 5 MB or smaller" }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "expert-chat")
    await mkdir(uploadDir, { recursive: true })

    const safeBaseName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_")
    const filename = `${Date.now()}-${randomUUID()}${extensionFor(file.type)}`
    const fullPath = path.join(uploadDir, filename)
    const bytes = Buffer.from(await file.arrayBuffer())
    await writeFile(fullPath, bytes)

    return NextResponse.json({
      asset: {
        url: `/uploads/expert-chat/${filename}`,
        name: safeBaseName || filename,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Upload failed"
    console.error("expert uploads POST", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
