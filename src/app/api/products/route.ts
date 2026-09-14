import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { enrichProductCopy, SHOP_CATALOG_SLUGS } from "@/lib/shop-catalog"

function isUsableCatalogImage(src: string | null | undefined) {
  if (!src) return false
  const normalized = src.trim()
  if (!normalized) return false
  if (normalized.includes("placeholder")) return false
  return true
}

function parseSpaceTypes(value: string | null | undefined) {
  if (!value) return []
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
}

function getPrimarySpaceType(spaceTypes: string[], categoryName?: string | null) {
  if (spaceTypes.length > 0) return spaceTypes[0]

  if (categoryName) {
    if (categoryName.includes("Indoor") || categoryName.includes("Succulent")) return "Indoor"
    if (categoryName.includes("Herb")) return "Balcony"
    if (categoryName.includes("Tree")) return "Garden"
    if (categoryName.includes("Flower")) return "Balcony"
  }

  return "All"
}

function normalizeSunExposureForFilter(value: string | null) {
  switch (value) {
    case "High":
      return ["Full_Sun"]
    case "Medium":
      return ["Partial_Sun", "Partial_Shade"]
    case "Low":
      return ["Full_Shade"]
    default:
      return value ? [value] : []
  }
}

// إنشاء instance واحد من Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spaceType = searchParams.get("spaceType")
    const budget = searchParams.get("budget")
    const sunExposure = searchParams.get("sunExposure")
    const waterLevel = searchParams.get("waterLevel")

    // جلب جميع المنتجات مع الفئات
    let products = await prisma.product.findMany({
      include: {
        category: true,
      },
      where: {
        slug: { in: [...SHOP_CATALOG_SLUGS] },
        stock_quantity: {
          gt: 0, // فقط المنتجات المتوفرة
        },
        is_active: true, // فقط المنتجات النشطة
      },
    })

    // تحويل البيانات إلى الصيغة المطلوبة
    const formattedProducts = products.map((product) => {
      // تحديد spaceType من space_types أو category
      const spaceTypes = parseSpaceTypes(product.space_types)
      const spaceTypeValue = getPrimarySpaceType(spaceTypes, product.category?.name)

      // تحديد budget من السعر
      let budgetValue = "$"
      const price = Number(product.price_ils)
      if (price > 50) {
        budgetValue = "$$$"
      } else if (price > 25) {
        budgetValue = "$$"
      }

      // تحويل sun_exposure و water_level من enum إلى string
      const sunExposure = product.sun_exposure?.toString() || "Medium"
      const waterLevel = product.water_level?.toString() || "Medium"
      const enhancement = enrichProductCopy({
        slug: product.slug,
        category: product.category?.name,
        baseDescription: product.description,
        sunExposure,
        waterLevel,
        spaceType: spaceTypeValue,
        imageUrl: isUsableCatalogImage(product.imageUrl) ? product.imageUrl!.trim() : null,
      })
      const primaryImage = enhancement.primaryImage

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: price,
        ecoScore: product.eco_score || 7,
        image: primaryImage,
        secondaryImage: enhancement.secondaryImage,
        spaceType: spaceTypeValue,
        spaceTypes,
        sunExposure: sunExposure,
        waterLevel: waterLevel,
        budget: budgetValue,
        description: enhancement.shortDescription,
        fullDescription: enhancement.fullDescription,
        careHighlights: enhancement.careHighlights,
        idealFor: enhancement.idealFor,
        stock: product.stock_quantity || 0,
        category: product.category?.name,
      }
    })

    // تطبيق الفلاتر
    let filtered = formattedProducts

    if (spaceType && spaceType !== "all") {
      filtered = filtered.filter((p) => p.spaceTypes.includes(spaceType) || p.spaceType === spaceType)
    }

    if (sunExposure && sunExposure !== "all") {
      const allowedSunExposure = normalizeSunExposureForFilter(sunExposure)
      filtered = filtered.filter((p) => allowedSunExposure.includes(p.sunExposure))
    }

    if (waterLevel && waterLevel !== "all") {
      filtered = filtered.filter((p) => p.waterLevel === waterLevel)
    }

    if (budget && budget !== "all") {
      filtered = filtered.filter((p) => p.budget === budget)
    }

    return NextResponse.json(filtered)
  } catch (error: any) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch products",
        message: error?.message || "Unknown error",
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
