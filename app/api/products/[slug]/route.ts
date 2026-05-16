import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { enrichProductCopy } from "@/lib/shop-catalog"

function isUsableCatalogImage(src: string | null | undefined) {
  if (!src) return false
  const normalized = src.trim()
  if (!normalized) return false
  if (normalized.includes("placeholder")) return false
  return true
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params
    const decoded = decodeURIComponent(slug)
    const idNum = parseInt(decoded, 10)

    let product = null
    if (!Number.isNaN(idNum) && String(idNum) === decoded) {
      product = await prisma.product.findFirst({
        where: { id: idNum, is_active: true },
        include: { category: true },
      })
    }
    if (!product) {
      product = await prisma.product.findFirst({
        where: { slug: decoded, is_active: true },
        include: { category: true },
      })
    }

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const price = Number(product.price_ils)
    let spaceTypeValue = "Indoor"
    if (product.space_types) {
      const parts = product.space_types.split(",").map((x) => x.trim())
      if (parts[0]) spaceTypeValue = parts[0]
    }

    const enhancement = enrichProductCopy({
      slug: product.slug,
      category: product.category?.name,
      baseDescription: product.description,
      sunExposure: String(product.sun_exposure),
      waterLevel: String(product.water_level),
      spaceType: spaceTypeValue,
    })
    const mainImage = enhancement.primaryImage || (isUsableCatalogImage(product.imageUrl) ? product.imageUrl!.trim() : enhancement.primaryImage)
    const images = Array.from(new Set([mainImage, enhancement.secondaryImage].filter(Boolean)))

    let related = await prisma.product.findMany({
      where: {
        is_active: true,
        stock_quantity: { gt: 0 },
        NOT: { id: product.id },
        categoryId: product.categoryId,
      },
      take: 4,
    })
    if (related.length === 0) {
      related = await prisma.product.findMany({
        where: {
          is_active: true,
          stock_quantity: { gt: 0 },
          NOT: { id: product.id },
        },
        take: 4,
      })
    }

    const suggestions = related.map((p) => ({
      ...enrichProductCopy({
        slug: p.slug,
        category: product.category?.name,
        baseDescription: p.description,
        sunExposure: String(p.sun_exposure),
        waterLevel: String(p.water_level),
        spaceType: p.space_types,
      }),
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price_ils),
      image:
        enrichProductCopy({
          slug: p.slug,
          category: p.categoryId === product.categoryId ? product.category?.name : null,
          baseDescription: p.description,
          sunExposure: String(p.sun_exposure),
          waterLevel: String(p.water_level),
          spaceType: p.space_types,
        }).primaryImage || (isUsableCatalogImage(p.imageUrl) ? p.imageUrl!.trim() : ""),
    }))

    return NextResponse.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: enhancement.fullDescription,
      price,
      image: mainImage,
      secondaryImage: enhancement.secondaryImage,
      images,
      ecoScore: product.eco_score || 7,
      stock: product.stock_quantity ?? 0,
      category: product.category?.name,
      spaceType: spaceTypeValue,
      sunExposure: String(product.sun_exposure),
      waterLevel: String(product.water_level),
      climateZones: product.climate_zones,
      careHighlights: enhancement.careHighlights,
      idealFor: enhancement.idealFor,
      suggestions,
    })
  } catch (e: any) {
    console.error("product detail", e)
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 })
  }
}
