// Thin wrapper around Groq's OpenAI-compatible chat completions endpoint.
// Raw fetch (no SDK dependency), consistent with src/services/email's Resend
// provider pattern. Falls back gracefully when GROQ_API_KEY is unset.

export interface GroqMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_call_id?: string;
  tool_calls?: GroqToolCall[];
  name?: string;
}

export interface GroqToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface GroqTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface GroqChatCompletionResponse {
  choices: {
    message: {
      role: "assistant";
      content: string | null;
      tool_calls?: GroqToolCall[];
    };
    finish_reason: string;
  }[];
  error?: { message: string };
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// openai/gpt-oss-120b is Groq's recommended tool-use model as of the 2026
// deprecation of llama-3.3-70b-versatile. Override via GROQ_MODEL if Groq
// ships a newer recommended model later.
const DEFAULT_MODEL = "openai/gpt-oss-120b";

export function isGroqEnabled(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export async function groqChatCompletion(params: {
  messages: GroqMessage[];
  tools?: GroqTool[];
  temperature?: number;
}): Promise<{ message: GroqMessage } | { error: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { error: "AI assistant is not configured (GROQ_API_KEY missing)." };
  }

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        messages: params.messages,
        tools: params.tools,
        temperature: params.temperature ?? 0.4,
        max_tokens: 700,
      }),
    });

    const data: GroqChatCompletionResponse = await res.json();

    if (!res.ok) {
      console.error("[Vistana AI] Groq API error:", data.error ?? data);
      return { error: "The assistant is temporarily unavailable. Please try WhatsApp instead." };
    }

    const choice = data.choices?.[0]?.message;
    if (!choice) {
      return { error: "The assistant didn't return a response. Please try again." };
    }

    return {
      message: {
        role: "assistant",
        content: choice.content ?? null,
        tool_calls: choice.tool_calls,
      },
    };
  } catch (e) {
    console.error("[Vistana AI] Groq request failed:", e);
    return { error: "The assistant is temporarily unavailable. Please try WhatsApp instead." };
  }
}
