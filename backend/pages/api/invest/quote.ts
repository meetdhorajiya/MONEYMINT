import type { NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';
import withAuth, { NextApiRequestWithUser } from '@/middleware/withAuth';

// Simple helper to extract useful message from unknown errors
function resolveErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

type AdviceSections = {
  snapshot: string;
  opportunity: string;
  risk: string;
  action: string;
  ideas: string[];
};

function extractAdviceText(response: unknown): string | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  if ('text' in response && typeof (response as { text?: unknown }).text === 'string') {
    return ((response as { text: string }).text).trim();
  }

  const record = response as Record<string, unknown>;
  const candidates = record.candidates;
  if (Array.isArray(candidates)) {
    for (const candidate of candidates) {
      const text = extractFromCandidate(candidate);
      if (text) return text;
    }
  }

  return null;
}

function extractFromCandidate(candidate: unknown): string | null {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const content = (candidate as Record<string, unknown>).content;
  if (!content || typeof content !== 'object') {
    return null;
  }

  const parts = (content as Record<string, unknown>).parts;
  if (!Array.isArray(parts)) {
    return null;
  }

  const collected: string[] = [];
  for (const part of parts) {
    if (part && typeof part === 'object' && 'text' in part && typeof (part as { text?: unknown }).text === 'string') {
      collected.push(((part as { text: string }).text).trim());
    }
  }

  if (collected.length === 0) {
    return null;
  }

  return collected.join('\n').trim();
}

function buildPrompt(amount: number, category?: string | null): string {
  const normalizedCategory = category ? category.trim() : 'general markets';
  return [
    'You are an investing research assistant. Provide concise, factual insights.',
    `Input amount (INR): ₹${amount.toFixed(2)}`,
    `Focus category or market: ${normalizedCategory}`,
    '',
    'Respond ONLY with valid JSON matching this TypeScript interface:',
    '{',
    '  "snapshot": string,',
    '  "opportunity": string,',
    '  "risk": string,',
    '  "action": string,',
    '  "ideas": string[] // 4 or 5 concise investable ideas (names, tickers, or instruments) relevant to the focus area',
    '}',
    '',
    'Guidelines:',
    '- Keep each field under 35 words.',
    '- Ideas should be punchy names (e.g., "HDFC Bank", "Gold ETFs"), no extra commentary.',
    '- Emphasize that outcomes are uncertain; treat the amount as a budget, not a guarantee.',
    '- Do not include Markdown, prose, or additional keys in the JSON.',
    '- End the "action" value with "Invest at your own risk."',
  ].join('\n');
}

function sanitizeJsonString(raw: string): string | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }
  return match[0];
}

function normalizeAdvice(raw: string): AdviceSections {
  const cleanRaw = raw.trim();
  const fallback: AdviceSections = {
    snapshot: cleanRaw,
    opportunity: cleanRaw,
    risk: 'Key risks could not be determined. Proceed cautiously.',
    action: 'Invest at your own risk.',
    ideas: [],
  };

  const jsonString = sanitizeJsonString(raw);
  if (!jsonString) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonString) as Partial<AdviceSections>;
    const parsedIdeas = Array.isArray(parsed.ideas)
      ? parsed.ideas
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter((item) => item.length > 0)
          .slice(0, 5)
      : fallback.ideas;

    return {
      snapshot: typeof parsed.snapshot === 'string' ? parsed.snapshot.trim() : fallback.snapshot,
      opportunity: typeof parsed.opportunity === 'string' ? parsed.opportunity.trim() : fallback.opportunity,
      risk: typeof parsed.risk === 'string' ? parsed.risk.trim() : fallback.risk,
      action: typeof parsed.action === 'string' ? parsed.action.trim() : fallback.action,
      ideas: parsedIdeas,
    };
  } catch (error) {
    console.warn('Failed to parse Gemini advice JSON:', error);
    return fallback;
  }
}

export default withAuth(async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const { amount, category } = req.body ?? {};

    // Basic validation
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'A valid amount > 0 is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API key is not configured on the server.' });
    }

    const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
    const client = new GoogleGenAI({ apiKey });

    const prompt = buildPrompt(numericAmount, category);

    const response = await client.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    const advice = extractAdviceText(response);

    if (!advice) {
      return res.status(502).json({
        message: 'Gemini did not return usable guidance.',
        raw: response,
      });
    }

    const structured = normalizeAdvice(advice);

    return res.status(200).json({
      success: true,
      advice: structured,
      riskNotice: 'Investments are inherently risky. This information is for educational purposes only. Invest at your own risk.',
    });
  } catch (error) {
    console.error('Invest quote proxy error:', error);
    return res.status(500).json({ message: resolveErrorMessage(error, 'Failed to fetch investment quote.') });
  }
});
