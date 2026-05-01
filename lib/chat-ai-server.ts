export type ChatAiMessage = { role: "user" | "assistant"; content: string }

export const SYSTEM_PROMPT = `You are GrowPal's AI plant-care assistant. GrowPal helps people in Palestine and the wider Levant grow sustainably—balconies, rooftops, small gardens.

Rules:
- Detect the user's language from their latest message (Arabic or English) and reply in the same language.
- Keep answers practical and concise (2-4 short paragraphs max unless they ask for detail).
- Give actionable steps, not generic advice. If information is missing, ask 1-2 focused follow-up questions.
- You are NOT replacing a licensed agronomist for legally sensitive claims; give general horticultural guidance.
- No markdown headings; plain text is fine.
- For quick preset questions, answer directly and helpfully.
- Do not repeat the same sentence or paragraph.`

function buildConversationText(messages: ChatAiMessage[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n")
}

async function openAiStyleComplete(
  url: string,
  headers: Record<string, string>,
  model: string,
  messages: ChatAiMessage[]
): Promise<string | null> {
  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.65,
      max_tokens: 700,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content?.trim() || null
}

/** Groq: generous free tier, OpenAI-compatible API */
export async function tryGroq(messages: ChatAiMessage[]): Promise<string | null> {
  const key = process.env.GROQ_API_KEY
  if (!key) return null
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant"
  return openAiStyleComplete(
    "https://api.groq.com/openai/v1/chat/completions",
    { Authorization: `Bearer ${key}` },
    model,
    messages
  )
}

/** OpenAI (paid) */
export async function tryOpenAI(messages: ChatAiMessage[]): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini"
  return openAiStyleComplete(
    "https://api.openai.com/v1/chat/completions",
    { Authorization: `Bearer ${key}` },
    model,
    messages
  )
}

/** Google Gemini (free tier with API key) */
export async function tryGemini(messages: ChatAiMessage[]): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash"

  let systemText = SYSTEM_PROMPT
  let start = 0
  while (start < messages.length && messages[start].role === "assistant") {
    systemText += `\n\n${messages[start].content}`
    start++
  }
  const body = messages.slice(start)
  if (body.length === 0) return null

  const contents: { role: string; parts: { text: string }[] }[] = []
  for (const m of body) {
    contents.push({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents,
        generationConfig: { temperature: 0.65, maxOutputTokens: 700 },
      }),
    }
  )

  if (!res.ok) return null
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("")?.trim()
  return text || null
}

/** Free no-key provider: Pollinations text endpoint */
export async function tryPollinations(messages: ChatAiMessage[]): Promise<string | null> {
  const convo = buildConversationText(messages).slice(-7000)
  const prompt = `${SYSTEM_PROMPT}

Conversation:
${convo}

Now reply to the latest user message only. Keep it practical and clear.`

  const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "text/plain, application/json" },
  })
  if (!res.ok) return null

  const raw = await res.text()
  const text = raw.trim()
  if (!text) return null
  return text
}

export async function generateLlmReply(trimmed: ChatAiMessage[]): Promise<{ reply: string; source: string } | null> {
  const chain: [string, () => Promise<string | null>][] = [
    ["groq", () => tryGroq(trimmed)],
    ["gemini", () => tryGemini(trimmed)],
    ["openai", () => tryOpenAI(trimmed)],
    ["pollinations", () => tryPollinations(trimmed)],
  ]

  for (const [name, fn] of chain) {
    try {
      const reply = await fn()
      if (reply) return { reply, source: name }
    } catch {
      /* try next */
    }
  }
  return null
}
