import { db } from "@/services/db";
import { groqChatCompletion, isGroqEnabled, type GroqMessage, type GroqTool } from "@/services/ai/groq";

// The assistant is grounded only in real data pulled from the DB at request
// time (per AGENTS.md's "no mock/placeholder data" rule) — it never invents
// tours, prices, or availability. It answers via tool calls, not memorized
// knowledge, for anything specific to Vistana's catalogue.

const TOOLS: GroqTool[] = [
  {
    type: "function",
    function: {
      name: "search_tours",
      description:
        "Search Vistana's real tour catalogue by keyword (destination, activity, or category like Safari/Beach/Adventure) and optional max budget in USD. Returns matching tours with price, duration, and difficulty.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Keyword to match against tour title, description, or category" },
          max_price_usd: { type: "number", description: "Optional maximum price per person in USD" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_tour_details",
      description: "Get full details (itinerary, inclusions, exclusions, FAQs) for one tour by its exact slug.",
      parameters: {
        type: "object",
        properties: { slug: { type: "string" } },
        required: ["slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_destinations",
      description: "List all destinations Vistana currently operates in, with a short overview of each.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "search_faqs",
      description: "Search Vistana's published FAQ list (booking policy, visas, payment, etc.) by keyword.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
];

async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "search_tours": {
      const query = String(args.query ?? "").toLowerCase();
      const maxPrice = typeof args.max_price_usd === "number" ? args.max_price_usd : undefined;
      const tours = await db.getTours();
      const matches = tours
        .filter((t) => {
          const haystack = `${t.title} ${t.description} ${t.category}`.toLowerCase();
          const matchesQuery = query ? haystack.includes(query) : true;
          const matchesPrice = maxPrice ? t.price_usd <= maxPrice : true;
          return matchesQuery && matchesPrice;
        })
        .slice(0, 6)
        .map((t) => ({
          slug: t.slug,
          title: t.title,
          category: t.category,
          duration_days: t.duration_days,
          price_usd: t.price_usd,
          difficulty: t.difficulty,
        }));
      return { count: matches.length, tours: matches };
    }
    case "get_tour_details": {
      const slug = String(args.slug ?? "");
      const tour = await db.getTourBySlug(slug);
      if (!tour) return { error: "No tour found with that slug." };
      return {
        title: tour.title,
        description: tour.description,
        duration_days: tour.duration_days,
        price_usd: tour.price_usd,
        difficulty: tour.difficulty,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        max_guests: tour.max_guests,
        min_guests: tour.min_guests,
        itinerary: tour.itinerary,
        faqs: tour.faqs,
      };
    }
    case "list_destinations": {
      const destinations = await db.getDestinations();
      return destinations.map((d) => ({ name: d.name, slug: d.slug, overview: d.overview }));
    }
    case "search_faqs": {
      const query = String(args.query ?? "").toLowerCase();
      const faqs = await db.getFaqs();
      const matches = faqs
        .filter((f) => !query || `${f.question} ${f.answer}`.toLowerCase().includes(query))
        .slice(0, 5)
        .map((f) => ({ question: f.question, answer: f.answer }));
      return { count: matches.length, faqs: matches };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

const SYSTEM_PROMPT = `You are the Vistana Tours & Travel AI travel assistant, embedded on the company's website.

Vistana Tours & Travel is a tour operator headquartered in Arusha, Tanzania, with a liaison office in Nairobi, Kenya, running safaris and travel experiences across Tanzania, Kenya, Zanzibar, and East Africa.

Rules:
- Use the provided tools to look up real tours, destinations, and FAQs before answering anything specific to Vistana's catalogue, prices, or availability. Never invent a tour, price, or itinerary detail that a tool didn't return.
- If tools return no matching results, say so honestly and suggest the customer contact the team directly rather than guessing.
- Keep answers concise and friendly, suited to a chat widget (short paragraphs, occasional bullet points).
- For booking, payment, cancellation, or account-specific requests you cannot fulfil in chat, direct the customer to the booking portal (/portal) or to WhatsApp/email for human follow-up.
- You are not able to make or modify a booking yourself — you can only inform, recommend, and hand off.
- Do not provide legal, medical, or visa/immigration advice beyond pointing to official sources and Vistana's own Terms of Service / Privacy Policy pages when relevant.`;

export interface AssistantChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function runAssistant(
  history: AssistantChatMessage[]
): Promise<{ reply: string } | { error: string }> {
  if (!isGroqEnabled()) {
    return { error: "The AI assistant isn't configured yet. Please reach us on WhatsApp or email instead." };
  }

  const messages: GroqMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content }) as GroqMessage),
  ];

  // Allow a short tool-calling loop: the model can call a few tools in
  // sequence (e.g. search_tours then get_tour_details) before its final reply.
  for (let iteration = 0; iteration < 4; iteration++) {
    const result = await groqChatCompletion({ messages, tools: TOOLS });
    if ("error" in result) return { error: result.error };

    const { message } = result;
    messages.push(message);

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return { reply: message.content ?? "Sorry, I didn't catch that — could you rephrase?" };
    }

    for (const call of message.tool_calls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        args = {};
      }
      const toolResult = await executeTool(call.function.name, args);
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        name: call.function.name,
        content: JSON.stringify(toolResult),
      });
    }
  }

  return { error: "That took longer than expected — please try a simpler question or reach us on WhatsApp." };
}
