import { GoogleGenerativeAI } from '@google/generative-ai';
import { executeQuery } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/rateLimit';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const MAX_HISTORY = 12; // keep the prompt small/cheap

// Pull current inventory so the bot can answer about real pieces.
async function getInventorySummary() {
  try {
    const rows = await executeQuery(
      `SELECT title, category, medium, dimensions, year_created, price, status, description
       FROM artworks ORDER BY created_at DESC LIMIT 40`
    );
    if (!rows.length) return 'There are no pieces listed in the catalog right now.';

    return rows
      .map((a) => {
        const price =
          a.status === 'Display'
            ? 'On display (not for sale)'
            : `₱${Number(a.price).toLocaleString('en-PH')}`;
        const desc = a.description ? ` — ${String(a.description).slice(0, 160)}` : '';
        return `• "${a.title}" | ${a.category} | ${a.medium || 'wood'} | ${
          a.dimensions || 'n/a'
        } | ${a.year_created} | ${price} | ${a.status}${desc}`;
      })
      .join('\n');
  } catch (error) {
    console.error('Chat inventory lookup failed:', error);
    return 'Inventory is temporarily unavailable.';
  }
}

function systemInstruction(inventory) {
  return `You are "Egay's Assistant", the friendly virtual helper for Egay's Woodwork —
a handcrafted woodworking studio based in Paete, Laguna, Philippines, run by the
Driodoco family (Edgar C. Driodoco and Jan Jacob D. Driodoco).

Your job:
- Help visitors learn about the four kinds of work the studio takes on:
  wood carving, wooden trophies, engraved name plates, and styrofoam sculpture.
  These four are the ONLY things Egay's Woodwork makes — never offer or imply
  furniture, cabinets, dining tables, home decor, or restoration work.
- Answer questions about specific pieces using the live catalog below.
- Explain how to inquire or commission a custom order (via the Contact page or
  the inquiry form on any piece). Prices are in Philippine Pesos (₱).

Rules:
- Be warm, concise, and helpful. Keep replies short (2-5 sentences) unless asked for detail.
- Only state facts you can support from the catalog or general woodworking knowledge.
  If you don't know a specific detail (exact stock, delivery dates), say so and point
  them to the contact form. Never invent prices or items.
- If asked something unrelated to the business, gently steer back to the woodwork.
- You cannot place orders or take payments; you can only guide and inform.

LIVE CATALOG (most recent pieces):
${inventory}`;
}

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'The chat assistant is not configured yet.' },
        { status: 503 }
      );
    }

    const ip = clientIp(request);
    const { allowed, retryAfter } = rateLimit(`chat:${ip}`, {
      limit: 20,
      windowMs: 60_000,
    });
    if (!allowed) {
      return Response.json(
        { error: `You're sending messages too quickly. Try again in ${retryAfter}s.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const latest = messages[messages.length - 1];

    if (!latest || latest.role !== 'user' || !latest.content?.trim()) {
      return Response.json({ error: 'No message provided.' }, { status: 400 });
    }
    if (latest.content.length > 2000) {
      return Response.json({ error: 'Message is too long.' }, { status: 400 });
    }

    const inventory = await getInventorySummary();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemInstruction(inventory),
    });

    // Build prior turns (everything except the latest user message) as history.
    const prior = messages.slice(0, -1).slice(-MAX_HISTORY);
    // Gemini requires history to start with a user turn.
    while (prior.length && prior[0].role !== 'user') prior.shift();
    const history = prior.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }],
    }));

    const chat = model.startChat({
      history,
      // Newer Gemini flash models spend part of the output budget on internal
      // reasoning, which truncated replies mid-sentence at 600. Keep the cap
      // generous; the system prompt is what actually keeps answers short.
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
    });

    const result = await chat.sendMessage(latest.content);
    const reply = result.response.text();

    return Response.json({ reply }, { status: 200 });
  } catch (error) {
    console.error('POST /api/chat error:', error);
    return Response.json(
      { error: 'Sorry, the assistant ran into a problem. Please try again.' },
      { status: 500 }
    );
  }
}
