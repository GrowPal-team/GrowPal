/**
 * Verifies MySQL connectivity and core GrowPal ↔ Prisma integration.
 * Run: npm run verify-db
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const [
    userCount,
    productCount,
    activeProducts,
    orderCount,
    orderItemCount,
    wishlistCount,
    lastOrders,
    sampleStock,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.product.count({ where: { is_active: true } }),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.wishlist_items.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        total_ils: true,
        status: true,
        createdAt: true,
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.product.findMany({
      take: 3,
      where: { is_active: true },
      select: { id: true, name: true, slug: true, stock_quantity: true },
      orderBy: { id: "asc" },
    }),
  ])

  const plantUsers = await prisma.user.count({
    where: { OR: [{ plantStage: { gt: 0 } }, { plantCompletions: { gt: 0 } }, { plantPendingGiftCode: { not: null } }] },
  })

  console.log(
    JSON.stringify(
      {
        ok: true,
        connection: "Prisma → DATABASE_URL (MySQL)",
        counts: {
          users: userCount,
          usersWithPlantProgress: plantUsers,
          products: productCount,
          activeProducts,
          orders: orderCount,
          orderLineItems: orderItemCount,
          wishlistRows: wishlistCount,
        },
        sampleProductsWithStock: sampleStock,
        recentOrders: lastOrders.map((o) => ({
          id: o.id,
          userId: o.userId,
          totalIls: o.total_ils.toString(),
          status: o.status,
          lineItems: o._count.orderItems,
          createdAt: o.createdAt,
        })),
      },
      null,
      2
    )
  )
}

main()
  .catch((e) => {
    console.error(JSON.stringify({ ok: false, error: String(e?.message || e) }, null, 2))
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
