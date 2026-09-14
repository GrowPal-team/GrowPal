import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function hasExpertModels(client: PrismaClient): boolean {
  return typeof (client as unknown as { expertThread?: unknown }).expertThread !== "undefined"
}

function getPrisma(): PrismaClient {
  const cached = globalForPrisma.prisma
  if (cached && hasExpertModels(cached)) {
    return cached
  }
  const fresh = new PrismaClient()
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = fresh
  }
  return fresh
}

export const prisma = getPrisma()
