import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseProductPayload } from "@/lib/admin-product-utils"
import { getServerSession } from "@/lib/session-server"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getServerSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: rawId } = await ctx.params
  const productId = Number(rawId)
  if (!productId) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 })
  }

  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseProductPayload(body)

    const current = await prisma.product.findUnique({ where: { id: productId } })
    if (!current) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    const category = await prisma.category.findUnique({ where: { id: payload.categoryId } })
    if (!category) {
      return NextResponse.json({ error: "Selected category was not found." }, { status: 400 })
    }

    const slugConflict = await prisma.product.findFirst({
      where: {
        slug: payload.slug,
        NOT: { id: productId },
      },
      select: { id: true },
    })
    if (slugConflict) {
      return NextResponse.json({ error: "Another product already uses this slug." }, { status: 409 })
    }

    await prisma.product.update({
      where: { id: productId },
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
    revalidatePath(`/product/${current.slug}`)
    if (current.slug !== payload.slug) {
      revalidatePath(`/product/${payload.slug}`)
    }

    return NextResponse.json({ ok: true, productId })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update product."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await getServerSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: rawId } = await ctx.params
  const productId = Number(rawId)
  if (!productId) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      slug: true,
      _count: {
        select: {
          orderItems: true,
          wishlist_items: true,
          productReviews: true,
          expertRecommendations: true,
        },
      },
    },
  })

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 })
  }

  const linkedCount =
    product._count.orderItems +
    product._count.wishlist_items +
    product._count.productReviews +
    product._count.expertRecommendations

  if (linkedCount > 0) {
    return NextResponse.json(
      {
        error: "This product is linked to existing orders, wishlists, reviews, or expert recommendations. Deactivate it instead of deleting it.",
      },
      { status: 409 }
    )
  }

  await prisma.product.delete({ where: { id: productId } })

  revalidatePath("/admin")
  revalidatePath("/admin/products")
  revalidatePath("/shop")
  revalidatePath(`/product/${product.slug}`)

  return NextResponse.json({ ok: true, productId })
}
