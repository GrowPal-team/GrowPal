import { NextRequest, NextResponse } from "next/server"
import { getFallbackReply } from "@/lib/expert-chat-fallback"
import { generateLlmReply, type ChatAiMessage } from "@/lib/chat-ai-server"

export type { ChatAiMessage }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const messages = body.messages as ChatAiMessage[] | undefined
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 })
    }

    const trimmed = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }))
      .slice(-16)

    const lastUser = [...trimmed].reverse().find((m) => m.role === "user")?.content ?? ""

    const llm = await generateLlmReply(trimmed)
    if (llm) {
      return NextResponse.json({ reply: llm.reply, source: llm.source })
    }

    const reply = getFallbackReply(lastUser)
    return NextResponse.json({ reply, source: "fallback" as const })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
