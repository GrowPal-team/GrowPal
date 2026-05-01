import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { enrichProductCopy } from "@/lib/shop-catalog"

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
        stock_quantity: {
          gt: 0, // فقط المنتجات المتوفرة
        },
        is_active: true, // فقط المنتجات النشطة
      },
      take: 50, // حد أقصى 50 منتج
    })

    // تحويل البيانات إلى الصيغة المطلوبة
    const formattedProducts = products.map((product) => {
      // تحديد spaceType من space_types أو category
      let spaceTypeValue = "All"
      if (product.space_types) {
        const spaceTypes = product.space_types.split(',').map(s => s.trim())
        if (spaceTypes.includes('Indoor')) spaceTypeValue = "Indoor"
        else if (spaceTypes.includes('Balcony')) spaceTypeValue = "Balcony"
        else if (spaceTypes.includes('Garden')) spaceTypeValue = "Garden"
        else if (spaceTypes.includes('Rooftop')) spaceTypeValue = "Rooftop"
        else if (spaceTypes.includes('Office')) spaceTypeValue = "Office"
      }
      
      if (spaceTypeValue === "All" && product.category?.name) {
        if (product.category.name.includes("Indoor") || product.category.name.includes("Succulent")) {
          spaceTypeValue = "Indoor"
        } else if (product.category.name.includes("Herb")) {
          spaceTypeValue = "Balcony"
        } else if (product.category.name.includes("Tree")) {
          spaceTypeValue = "Garden"
        } else if (product.category.name.includes("Flower")) {
          spaceTypeValue = "Balcony"
        }
      }

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
      })
      const primaryImage = product.imageUrl?.trim() || enhancement.primaryImage

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: price,
        ecoScore: product.eco_score || 7,
        image: primaryImage,
        secondaryImage: enhancement.secondaryImage,
        spaceType: spaceTypeValue,
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
      filtered = filtered.filter((p) => p.spaceType === spaceType)
    }

    if (sunExposure && sunExposure !== "all") {
      filtered = filtered.filter((p) => p.sunExposure === sunExposure)
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
