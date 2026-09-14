import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-server"

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
  const session = await getServerSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only jpg, png, webp, and gif uploads are supported." }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products")
    await mkdir(uploadDir, { recursive: true })

    const filename = `${Date.now()}-${randomUUID()}${extensionFor(file.type)}`
    const fullPath = path.join(uploadDir, filename)
    const bytes = Buffer.from(await file.arrayBuffer())
    await writeFile(fullPath, bytes)

    return NextResponse.json({
      asset: {
        url: `/uploads/products/${filename}`,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
