import { prisma } from "@/lib/prisma"

export type AdminUserRow = {
  id: number
  full_name: string
  email: string
  role: string
  email_verified: number | null
  status: string
  created_at: Date | string
}

export type AdminExpertRow = {
  id: number
  full_name: string
  email: string
  created_at: Date | string
  display_name: string | null
  specialization: string | null
  approval_status: string
}

export type AdminCategoryRow = {
  id: number
  name: string
  slug: string
}

export type AdminProductRow = {
  id: number
  name: string
  slug: string
  description: string | null
  price_ils: number | string
  image_url: string | null
  category_id: number
  category_name: string
  sun_exposure: string
  water_level: string
  maintenance_level: string
  weight_level: string
  climate_zones: string
  seasons: string
  eco_score: number
  space_types: string
  stock_quantity: number | null
  is_active: number | boolean | null
  created_at: Date | string
}

type CountRow = {
  count: bigint | number
}

type DecimalRow = {
  amount: number | string | null
}

function toNumber(value: bigint | number | null | undefined) {
  return Number(value || 0)
}

export async function getAdminUsers(limit = 30) {
  return prisma.$queryRaw<Array<AdminUserRow>>`
    SELECT
      id,
      full_name,
      email,
      role,
      email_verified,
      COALESCE(status, 'active') AS status,
      created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
}

export async function getAdminExperts(limit = 30) {
  return prisma.$queryRaw<Array<AdminExpertRow>>`
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.created_at,
      e.display_name,
      e.specialization,
      COALESCE(e.approval_status, 'approved') AS approval_status
    FROM users u
    LEFT JOIN experts e ON e.user_id = u.id
    WHERE u.role = 'expert'
    ORDER BY u.created_at DESC
    LIMIT ${limit}
  `
}

export async function getAdminCategories() {
  return prisma.$queryRaw<Array<AdminCategoryRow>>`
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `
}

export async function getAdminProducts(limit = 200) {
  const rows = await prisma.$queryRaw<Array<AdminProductRow>>`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price_ils,
      p.image_url,
      p.category_id,
      c.name AS category_name,
      p.sun_exposure,
      p.water_level,
      p.maintenance_level,
      p.weight_level,
      p.climate_zones,
      p.seasons,
      p.eco_score,
      p.space_types,
      p.stock_quantity,
      p.is_active,
      p.created_at
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ${limit}
  `

  return rows.map((row) => ({
    ...row,
    price_ils: Number(row.price_ils),
    is_active: Boolean(row.is_active),
    created_at:
      row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }))
}

export async function getAdminSummary() {
  const [usersRow, expertsRow, adminsRow, ordersRow, blockedUsersRow, pendingExpertsRow] = await Promise.all([
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM users`,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM users WHERE role = 'expert'`,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM users WHERE role = 'admin'`,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM orders`,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM users WHERE COALESCE(status, 'active') = 'blocked'`,
    prisma.$queryRaw<Array<CountRow>>`
      SELECT COUNT(*) AS count
      FROM users u
      LEFT JOIN experts e ON e.user_id = u.id
      WHERE u.role = 'expert'
        AND COALESCE(e.approval_status, 'approved') = 'pending'
    `,
  ])

  return {
    totalUsers: toNumber(usersRow[0]?.count),
    totalExperts: toNumber(expertsRow[0]?.count),
    totalAdmins: toNumber(adminsRow[0]?.count),
    totalOrders: toNumber(ordersRow[0]?.count),
    blockedUsers: toNumber(blockedUsersRow[0]?.count),
    pendingExperts: toNumber(pendingExpertsRow[0]?.count),
  }
}

export async function getAdminAnalytics() {
  const [
    productRows,
    activeProductRows,
    outOfStockRows,
    categoryRows,
    wishlistRows,
    reviewRows,
    activeGrowerRows,
    plantCompletionRows,
    spacesRows,
    climateZoneRows,
    paidOrdersRows,
    pendingOrdersRows,
    deliveredOrdersRows,
    cancelledOrdersRows,
    revenueRows,
    averageOrderRows,
    openThreadRows,
    claimedThreadRows,
    closedThreadRows,
  ] = await Promise.all([
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM products`,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM products WHERE COALESCE(is_active, 1) = 1`,
    prisma.$queryRaw<Array<CountRow>>`
      SELECT COUNT(*) AS count
      FROM products
      WHERE COALESCE(stock_quantity, 0) <= 0
    `,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM categories`,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM wishlist_items`,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM product_reviews`,
    prisma.$queryRaw<Array<CountRow>>`
      SELECT COUNT(*) AS count
      FROM users
      WHERE COALESCE(plant_stage, 0) > 0 OR COALESCE(plant_completions, 0) > 0
    `,
    prisma.$queryRaw<Array<DecimalRow>>`
      SELECT COALESCE(SUM(plant_completions), 0) AS amount
      FROM users
    `,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM spaces`,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM climate_zones`,
    prisma.$queryRaw<Array<CountRow>>`
      SELECT COUNT(*) AS count
      FROM orders
      WHERE status IN ('PAID_MOCK', 'PAID', 'SHIPPED', 'DELIVERED')
    `,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM orders WHERE status = 'PENDING'`,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM orders WHERE status = 'DELIVERED'`,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM orders WHERE status = 'CANCELLED'`,
    prisma.$queryRaw<Array<DecimalRow>>`
      SELECT COALESCE(SUM(total_ils), 0) AS amount
      FROM orders
      WHERE status IN ('PAID_MOCK', 'PAID', 'SHIPPED', 'DELIVERED')
    `,
    prisma.$queryRaw<Array<DecimalRow>>`
      SELECT COALESCE(AVG(total_ils), 0) AS amount
      FROM orders
      WHERE status IN ('PAID_MOCK', 'PAID', 'SHIPPED', 'DELIVERED')
    `,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM expert_threads WHERE status = 'open'`,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM expert_threads WHERE status = 'claimed'`,
    prisma.$queryRaw<Array<CountRow>>`SELECT COUNT(*) AS count FROM expert_threads WHERE status = 'closed'`,
  ])

  return {
    plants: {
      totalProducts: toNumber(productRows[0]?.count),
      activeProducts: toNumber(activeProductRows[0]?.count),
      outOfStockProducts: toNumber(outOfStockRows[0]?.count),
      categories: toNumber(categoryRows[0]?.count),
      wishlistItems: toNumber(wishlistRows[0]?.count),
      reviews: toNumber(reviewRows[0]?.count),
      activeGrowers: toNumber(activeGrowerRows[0]?.count),
      plantCompletions: toNumber(Number(plantCompletionRows[0]?.amount || 0)),
      spaces: toNumber(spacesRows[0]?.count),
      climateZones: toNumber(climateZoneRows[0]?.count),
    },
    payments: {
      paidOrders: toNumber(paidOrdersRows[0]?.count),
      pendingOrders: toNumber(pendingOrdersRows[0]?.count),
      deliveredOrders: toNumber(deliveredOrdersRows[0]?.count),
      cancelledOrders: toNumber(cancelledOrdersRows[0]?.count),
      grossRevenueIls: Number(revenueRows[0]?.amount || 0),
      averageOrderValueIls: Number(averageOrderRows[0]?.amount || 0),
    },
    support: {
      openThreads: toNumber(openThreadRows[0]?.count),
      claimedThreads: toNumber(claimedThreadRows[0]?.count),
      closedThreads: toNumber(closedThreadRows[0]?.count),
    },
  }
}

export function getAdminSettingsOverview() {
  return {
    system: [
      {
        label: "Database provider",
        value: "MySQL",
        hint: "Connected through Prisma + XAMPP.",
      },
      {
        label: "Session secret",
        value: process.env.SESSION_SECRET ? "Configured" : "Fallback local secret",
        hint: process.env.SESSION_SECRET
          ? "Secure cookie signing is using an explicit secret."
          : "Add SESSION_SECRET in production for stronger security.",
      },
      {
        label: "Checkout mode",
        value: "Mock payment",
        hint: "Orders are currently recorded with PAID_MOCK in the checkout route.",
      },
      {
        label: "Auth backend",
        value: "PHP bridge active",
        hint: "Next auth requests are forwarded to the PHP API.",
      },
    ],
    adminSections: [
      {
        label: "Users",
        hint: "Search, filter, activate, or block accounts.",
      },
      {
        label: "Experts",
        hint: "Approve, hold, or reject expert access.",
      },
      {
        label: "Products",
        hint: "Add, edit, deactivate, or delete catalog entries.",
      },
      {
        label: "Plants & Payments",
        hint: "Monitor catalog, orders, revenue, and plant progress.",
      },
    ],
  }
}
