import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

const FALLBACK_WISHLIST_IMAGE =
  "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80"

function isUsableWishlistImage(src: string | null | undefined) {
  if (!src) return false
  const normalized = src.trim()
  if (!normalized) return false
  if (normalized.includes("placeholder")) return false
  if (normalized.startsWith("/Web/")) return false
  if (normalized.startsWith("/images/")) return false
  if (normalized.startsWith("Web/")) return false
  if (normalized.startsWith("images/")) return false
  return true
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json([], { status: 200 })
    }
    const uid = parseInt(userId, 10)
    if (Number.isNaN(uid)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 })
    }
    const rows = await prisma.wishlist_items.findMany({
      where: { user_id: uid },
      include: { products: { include: { category: true } } },
      orderBy: { created_at: "desc" },
    })
    const items = rows.map((w) => {
      const p = w.products
      const price = Number(p.price_ils)
      return {
        id: p.id,
        name: p.name,
        price,
        image: isUsableWishlistImage(p.imageUrl) ? p.imageUrl!.trim() : FALLBACK_WISHLIST_IMAGE,
        slug: p.slug,
      }
    })
    return NextResponse.json(items)
  } catch (e: any) {
    console.error("wishlist GET", e)
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = Number(body.userId)
    const productId = Number(body.productId)
    if (!userId || !productId) {
      return NextResponse.json({ error: "userId and productId required" }, { status: 400 })
    }
    await prisma.wishlist_items.create({
      data: { user_id: userId, product_id: productId },
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: true, already: true })
    }
    console.error("wishlist POST", e)
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const userId = Number(body.userId)
    const productId = Number(body.productId)
    if (!userId || !productId) {
      return NextResponse.json({ error: "userId and productId required" }, { status: 400 })
    }
    await prisma.wishlist_items.deleteMany({
      where: { user_id: userId, product_id: productId },
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("wishlist DELETE", e)
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 })
  }
}
