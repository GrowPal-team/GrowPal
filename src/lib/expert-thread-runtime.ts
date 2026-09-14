import { prisma } from "@/lib/prisma"

type DbClient = typeof prisma | any

export function getExpertThreadModel(client: DbClient = prisma): any | null {
  return (client as any).expertThread ?? null
}

export async function listThreadsForUser(userId: number): Promise<any[]> {
  const model = getExpertThreadModel()
  if (model) {
    return model.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        claimedByExpert: { select: { id: true, full_name: true, email: true } },
      },
    })
  }

  const rows = await prisma.$queryRaw<Array<any>>`
    SELECT
      t.id,
      t.user_id,
      t.status,
      t.claimed_by_expert_id,
      t.claimed_at,
      t.subject,
      t.last_message_preview,
      t.updated_at,
      t.created_at,
      ex.id AS claimed_id,
      ex.full_name AS claimed_name,
      ex.email AS claimed_email
    FROM expert_threads t
    LEFT JOIN users ex ON ex.id = t.claimed_by_expert_id
    WHERE t.user_id = ${userId}
    ORDER BY t.updated_at DESC
  `

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    status: row.status,
    claimedByExpertUserId: row.claimed_by_expert_id,
    claimedAt: row.claimed_at,
    subject: row.subject,
    lastMessagePreview: row.last_message_preview,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    claimedByExpert: row.claimed_id
      ? { id: row.claimed_id, full_name: row.claimed_name, email: row.claimed_email }
      : null,
  }))
}

export async function listThreadsForExpert(expertUserId: number): Promise<any[]> {
  const model = getExpertThreadModel()
  if (model) {
    return model.findMany({
      where: {
        OR: [{ status: "open" }, { claimedByExpertUserId: expertUserId }],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        customer: { select: { id: true, full_name: true, email: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { senderRole: true },
        },
      },
    })
  }

  const rows = await prisma.$queryRaw<Array<any>>`
    SELECT
      t.id,
      t.user_id,
      t.status,
      t.claimed_by_expert_id,
      t.claimed_at,
      t.subject,
      t.last_message_preview,
      t.updated_at,
      t.created_at,
      (
        SELECT m.sender_role
        FROM expert_thread_messages m
        WHERE m.thread_id = t.id
        ORDER BY m.created_at DESC, m.id DESC
        LIMIT 1
      ) AS last_sender_role,
      u.id AS customer_id,
      u.full_name AS customer_name,
      u.email AS customer_email
    FROM expert_threads t
    INNER JOIN users u ON u.id = t.user_id
    WHERE (t.status = 'open' OR t.claimed_by_expert_id = ${expertUserId})
    ORDER BY t.updated_at DESC
  `

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    status: row.status,
    claimedByExpertUserId: row.claimed_by_expert_id,
    claimedAt: row.claimed_at,
    subject: row.subject,
    lastMessagePreview: row.last_message_preview,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    customer: {
      id: row.customer_id,
      full_name: row.customer_name,
      email: row.customer_email,
    },
    lastSenderRole: row.last_sender_role || null,
    unread: row.last_sender_role === "customer",
  }))
}

export async function getThreadCountForUser(userId: number): Promise<number> {
  const model = getExpertThreadModel()
  if (model) {
    return model.count({ where: { userId } })
  }

  const rows = await prisma.$queryRaw<Array<{ count: bigint | number }>>`
    SELECT COUNT(*) AS count
    FROM expert_threads
    WHERE user_id = ${userId}
  `
  return Number(rows[0]?.count || 0)
}

export async function getActiveThreadForUser(userId: number): Promise<{ id: number; status: string } | null> {
  const model = getExpertThreadModel()
  if (model) {
    return model.findFirst({
      where: { userId, status: { not: "closed" } },
      orderBy: { updatedAt: "desc" },
      select: { id: true, status: true },
    })
  }

  const rows = await prisma.$queryRaw<Array<{ id: number; status: string }>>`
    SELECT id, status
    FROM expert_threads
    WHERE user_id = ${userId}
      AND status <> 'closed'
    ORDER BY updated_at DESC
    LIMIT 1
  `
  return rows[0] || null
}

export async function getBasicThread(threadId: number): Promise<any | null> {
  const model = getExpertThreadModel()
  if (model) {
    return model.findUnique({ where: { id: threadId } })
  }

  const rows = await prisma.$queryRaw<Array<any>>`
    SELECT
      id,
      user_id,
      status,
      claimed_by_expert_id,
      claimed_at,
      subject,
      last_message_preview,
      updated_at,
      created_at
    FROM expert_threads
    WHERE id = ${threadId}
    LIMIT 1
  `

  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    claimedByExpertUserId: row.claimed_by_expert_id,
    claimedAt: row.claimed_at,
    subject: row.subject,
    lastMessagePreview: row.last_message_preview,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  }
}

export async function loadThreadDetail(threadId: number): Promise<any | null> {
  const model = getExpertThreadModel()
  if (model) {
    return model.findUnique({
      where: { id: threadId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        customer: { select: { id: true, full_name: true, email: true } },
        claimedByExpert: { select: { id: true, full_name: true, email: true } },
        recommendations: {
          orderBy: { createdAt: "asc" },
          include: {
            product: {
              select: { id: true, name: true, slug: true, price_ils: true, imageUrl: true },
            },
          },
        },
      },
    })
  }

  const [threadRows, messageRows] = await Promise.all([
    prisma.$queryRaw<Array<any>>`
      SELECT
        t.id,
        t.user_id,
        t.status,
        t.claimed_by_expert_id,
        t.claimed_at,
        t.subject,
        t.last_message_preview,
        t.updated_at,
        t.created_at,
        cu.id AS customer_id,
        cu.full_name AS customer_name,
        cu.email AS customer_email,
        ex.id AS expert_id,
        ex.full_name AS expert_name,
        ex.email AS expert_email
      FROM expert_threads t
      INNER JOIN users cu ON cu.id = t.user_id
      LEFT JOIN users ex ON ex.id = t.claimed_by_expert_id
      WHERE t.id = ${threadId}
      LIMIT 1
    `,
    prisma.$queryRaw<Array<any>>`
      SELECT id, thread_id, sender_user_id, sender_role, body, created_at
      FROM expert_thread_messages
      WHERE thread_id = ${threadId}
      ORDER BY created_at ASC, id ASC
    `,
  ])

  const row = threadRows[0]
  if (!row) return null

  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    claimedByExpertUserId: row.claimed_by_expert_id,
    claimedAt: row.claimed_at,
    subject: row.subject,
    lastMessagePreview: row.last_message_preview,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    customer: {
      id: row.customer_id,
      full_name: row.customer_name,
      email: row.customer_email,
    },
    claimedByExpert: row.expert_id
      ? { id: row.expert_id, full_name: row.expert_name, email: row.expert_email }
      : null,
    messages: messageRows.map((message) => ({
      id: message.id,
      threadId: message.thread_id,
      senderUserId: message.sender_user_id,
      senderRole: message.sender_role,
      body: message.body,
      createdAt: message.created_at,
    })),
    recommendations: [],
  }
}

export async function createThreadWithFirstMessage(args: {
  userId: number
  subject: string | null
  preview: string
  body: string
}): Promise<{ threadId: number; messageId: number }> {
  return prisma.$transaction(async (tx) => {
    const model = getExpertThreadModel(tx)
    if (model) {
      const thread = await model.create({
        data: {
          userId: args.userId,
          status: "open",
          subject: args.subject,
          lastMessagePreview: args.preview,
        },
      })
      const message = await (tx as any).expertThreadMessage.create({
        data: {
          threadId: thread.id,
          senderUserId: args.userId,
          senderRole: "customer",
          body: args.body,
        },
      })
      return { threadId: thread.id, messageId: message.id }
    }

    await tx.$executeRaw`
      INSERT INTO expert_threads (user_id, status, subject, last_message_preview)
      VALUES (${args.userId}, 'open', ${args.subject}, ${args.preview})
    `
    const threadRows = await tx.$queryRaw<Array<{ id: number }>>`SELECT LAST_INSERT_ID() AS id`
    const threadId = threadRows[0].id

    await tx.$executeRaw`
      INSERT INTO expert_thread_messages (thread_id, sender_user_id, sender_role, body)
      VALUES (${threadId}, ${args.userId}, 'customer', ${args.body})
    `
    const messageRows = await tx.$queryRaw<Array<{ id: number }>>`SELECT LAST_INSERT_ID() AS id`

    return { threadId, messageId: messageRows[0].id }
  })
}

export async function addThreadMessage(args: {
  threadId: number
  senderUserId: number | null
  senderRole: "customer" | "expert" | "system"
  body: string
}): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const messageModel = (tx as any).expertThreadMessage
    if (messageModel) {
      const message = await messageModel.create({
        data: {
          threadId: args.threadId,
          senderUserId: args.senderUserId,
          senderRole: args.senderRole,
          body: args.body,
        },
      })
      return message.id
    }

    await tx.$executeRaw`
      INSERT INTO expert_thread_messages (thread_id, sender_user_id, sender_role, body)
      VALUES (${args.threadId}, ${args.senderUserId}, ${args.senderRole}, ${args.body})
    `
    const rows = await tx.$queryRaw<Array<{ id: number }>>`SELECT LAST_INSERT_ID() AS id`
    return rows[0].id
  })
}

export async function updateThreadAfterMessage(args: {
  threadId: number
  preview: string
  claimedByExpertUserId?: number
  claimNow?: boolean
}) {
  return prisma.$transaction(async (tx) => {
    const model = getExpertThreadModel(tx)
    if (model) {
      if (args.claimNow && args.claimedByExpertUserId) {
        await model.update({
          where: { id: args.threadId },
          data: {
            claimedByExpertUserId: args.claimedByExpertUserId,
            status: "claimed",
            claimedAt: new Date(),
            lastMessagePreview: args.preview,
          },
        })
      } else {
        await model.update({
          where: { id: args.threadId },
          data: { lastMessagePreview: args.preview },
        })
      }
      return
    }

    if (args.claimNow && args.claimedByExpertUserId) {
      await tx.$executeRaw`
        UPDATE expert_threads
        SET claimed_by_expert_id = ${args.claimedByExpertUserId},
            status = 'claimed',
            claimed_at = NOW(),
            last_message_preview = ${args.preview}
        WHERE id = ${args.threadId}
      `
    } else {
      await tx.$executeRaw`
        UPDATE expert_threads
        SET last_message_preview = ${args.preview}
        WHERE id = ${args.threadId}
      `
    }
  })
}

export async function closeThread(threadId: number) {
  return prisma.$transaction(async (tx) => {
    const model = getExpertThreadModel(tx)
    if (model) {
      await model.update({
        where: { id: threadId },
        data: { status: "closed" },
      })
    } else {
      await tx.$executeRaw`
        UPDATE expert_threads
        SET status = 'closed'
        WHERE id = ${threadId}
      `
    }

    const messageModel = (tx as any).expertThreadMessage
    if (messageModel) {
      await messageModel.create({
        data: {
          threadId,
          senderUserId: null,
          senderRole: "system",
          body: "Thank you for using GrowPal expert support. This consultation is now closed. Please rate your experience (private and anonymous). You can start a new expert consultation for ₪ 20.",
        },
      })
    } else {
      await tx.$executeRaw`
        INSERT INTO expert_thread_messages (thread_id, sender_user_id, sender_role, body)
        VALUES (${threadId}, NULL, 'system', 'Thank you for using GrowPal expert support. This consultation is now closed. Please rate your experience (private and anonymous). You can start a new expert consultation for ₪ 20.')
      `
    }
  })
}

const AUTO_CLOSE_WINDOW_HOURS = 24

export async function closeExpiredThreadsForUser(userId: number): Promise<number> {
  const model = getExpertThreadModel()
  const cutoff = new Date(Date.now() - AUTO_CLOSE_WINDOW_HOURS * 60 * 60 * 1000)
  let staleThreads: Array<{ id: number }> = []
  if (model) {
    staleThreads = await model.findMany({
      where: {
        userId,
        status: { not: "closed" },
        updatedAt: { lt: cutoff },
      },
      select: { id: true },
    })
  } else {
    const rows = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id
      FROM expert_threads
      WHERE user_id = ${userId}
        AND status <> 'closed'
        AND updated_at < DATE_SUB(NOW(), INTERVAL ${AUTO_CLOSE_WINDOW_HOURS} HOUR)
    `
    staleThreads = rows
  }

  for (const thread of staleThreads) {
    await closeThread(thread.id)
  }
  return staleThreads.length
}

export async function closeExpiredThreadsForExpertInbox(expertUserId: number): Promise<number> {
  const model = getExpertThreadModel()
  let userIds: number[] = []
  if (model) {
    const rows = await model.findMany({
      where: {
        status: { not: "closed" },
        OR: [{ status: "open" }, { claimedByExpertUserId: expertUserId }],
      },
      select: { userId: true },
      distinct: ["userId"],
    })
    userIds = rows.map((row: { userId: number }) => row.userId)
  } else {
    const rows = await prisma.$queryRaw<Array<{ user_id: number }>>`
      SELECT DISTINCT user_id
      FROM expert_threads
      WHERE status <> 'closed'
        AND (status = 'open' OR claimed_by_expert_id = ${expertUserId})
    `
    userIds = rows.map((row) => row.user_id)
  }

  let totalClosed = 0
  for (const userId of userIds) {
    totalClosed += await closeExpiredThreadsForUser(userId)
  }
  return totalClosed
}
