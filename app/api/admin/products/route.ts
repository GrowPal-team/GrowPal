import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseProductPayload } from "@/lib/admin-product-utils"
import { getServerSession } from "@/lib/session-server"

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseProductPayload(body)

    const category = await prisma.category.findUnique({ where: { id: payload.categoryId } })
    if (!category) {
      return NextResponse.json({ error: "Selected category was not found." }, { status: 400 })
    }

    const existing = await prisma.product.findFirst({ where: { slug: payload.slug } })
    if (existing) {
      return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 })
    }

    const product = await prisma.product.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        price_ils: payload.priceIls,
        imageUrl: payload.imageUrl,
        categoryId: payload.categoryId,
        sun_exposure: payload.sunExposure,
        water_level: payload.waterLevel,
        maintenance_level: payload.maintenanceLevel,
        weight_level: payload.weightLevel,
        climate_zones: payload.climateZones,
        seasons: payload.seasons,
        eco_score: payload.ecoScore,
        space_types: payload.spaceTypes,
        stock_quantity: payload.stockQuantity,
        is_active: true,
      },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/products")
    revalidatePath("/shop")

    return NextResponse.json({ ok: true, productId: product.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create product."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
