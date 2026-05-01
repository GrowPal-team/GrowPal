import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"

export type UploadedAsset = {
  url: string
  name: string
  contentType: string
  uploadedAt: string
}

type SpaceExtras = {
  notes: string
  photos: UploadedAsset[]
  updatedAt: string
}

type ThreadRating = {
  rating: number
  feedback: string
  submittedAt: string
  anonymous: true
}

type ExpertConsultationStore = {
  paidCredits: Record<string, number>
  messageAttachments: Record<string, UploadedAsset[]>
  spaceExtras: Record<string, SpaceExtras>
  threadRatings: Record<string, ThreadRating>
}

const DATA_DIR = path.join(process.cwd(), "data")
const STORE_PATH = path.join(DATA_DIR, "expert-consultation-store.json")

const EMPTY_STORE: ExpertConsultationStore = {
  paidCredits: {},
  messageAttachments: {},
  spaceExtras: {},
  threadRatings: {},
}

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true })
}

async function readStore(): Promise<ExpertConsultationStore> {
  await ensureDir()
  try {
    const raw = await readFile(STORE_PATH, "utf8")
    const parsed = JSON.parse(raw) as Partial<ExpertConsultationStore>
    return {
      paidCredits: parsed.paidCredits && typeof parsed.paidCredits === "object" ? parsed.paidCredits : {},
      messageAttachments:
        parsed.messageAttachments && typeof parsed.messageAttachments === "object"
          ? parsed.messageAttachments
          : {},
      spaceExtras: parsed.spaceExtras && typeof parsed.spaceExtras === "object" ? parsed.spaceExtras : {},
      threadRatings: parsed.threadRatings && typeof parsed.threadRatings === "object" ? parsed.threadRatings : {},
    }
  } catch {
    return { ...EMPTY_STORE }
  }
}

async function writeStore(store: ExpertConsultationStore) {
  await ensureDir()
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8")
}

export async function getPaidConsultationCredits(userId: number): Promise<number> {
  const store = await readStore()
  return store.paidCredits[String(userId)] || 0
}

export async function addPaidConsultationCredit(userId: number, count = 1): Promise<number> {
  const store = await readStore()
  const key = String(userId)
  store.paidCredits[key] = (store.paidCredits[key] || 0) + count
  await writeStore(store)
  return store.paidCredits[key]
}

export async function consumePaidConsultationCredit(userId: number): Promise<boolean> {
  const store = await readStore()
  const key = String(userId)
  const current = store.paidCredits[key] || 0
  if (current < 1) return false
  store.paidCredits[key] = current - 1
  await writeStore(store)
  return true
}

export async function getMessageAttachments(messageId: number): Promise<UploadedAsset[]> {
  const store = await readStore()
  return store.messageAttachments[String(messageId)] || []
}

export async function getMessageAttachmentMap(messageIds: number[]): Promise<Record<number, UploadedAsset[]>> {
  const store = await readStore()
  const result: Record<number, UploadedAsset[]> = {}
  for (const id of messageIds) {
    result[id] = store.messageAttachments[String(id)] || []
  }
  return result
}

export async function setMessageAttachments(messageId: number, attachments: UploadedAsset[]) {
  const store = await readStore()
  store.messageAttachments[String(messageId)] = attachments
  await writeStore(store)
}

export async function getSpaceExtras(userId: number): Promise<SpaceExtras | null> {
  const store = await readStore()
  return store.spaceExtras[String(userId)] || null
}

export async function setSpaceExtras(userId: number, extras: { notes: string; photos: UploadedAsset[] }) {
  const store = await readStore()
  store.spaceExtras[String(userId)] = {
    notes: extras.notes,
    photos: extras.photos,
    updatedAt: new Date().toISOString(),
  }
  await writeStore(store)
}

export async function getThreadRating(threadId: number): Promise<ThreadRating | null> {
  const store = await readStore()
  return store.threadRatings[String(threadId)] || null
}

export async function setThreadRating(threadId: number, rating: Omit<ThreadRating, "submittedAt" | "anonymous">) {
  const store = await readStore()
  store.threadRatings[String(threadId)] = {
    ...rating,
    submittedAt: new Date().toISOString(),
    anonymous: true,
  }
  await writeStore(store)
}
