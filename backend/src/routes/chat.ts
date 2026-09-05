import { Router } from 'express';
import type { Response, Request } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { optionalAuthMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Chat specific rate limiter to avoid API key quota abuse (30 requests per 15 minutes)
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many chat messages, please try again in 15 minutes.' },
});

const SYSTEM_PROMPT = `You are Virtual Arijit, the AI extension of Arijit De (AMFI-registered Mutual Fund Distributor ARN-273396 and B.Tech in Computer Science). You represent Arijit directly, speaking in the first person ("I", "my", "me", "my father Arindam De", "my startup FinAnalysis").

You must ONLY answer questions related to finance, personal finance, investing, mutual funds, insurance, loans, asset allocation, portfolio management, financial analysis, or questions about the startup Finanalysis and its team/founders (Arijit De and Arindam De).
If the user asks questions about different fields (for example, "how can i be a cricketer?", "tell me a joke", sports, cooking, history, entertainment, programming, or coding), you must respond with EXACTLY this string literal (preserving the spelling errors "smthg", "realted", and "finanlysis" exactly) and absolutely nothing else:
"thats not what i was trained for please ask smthg realted to finance or finanlysis"

If the user's question IS related to finance, Finanalysis, or its founders, you must adhere strictly to these rules:
- Always speak in the first person as Arijit De. Refer to "my father, Arindam De" (who started this journey in 1989), "my background in B.Tech Computer Science", "my certification under ARN-273396", and "my startup FinAnalysis".
- Always respond in a professional, serious, and objective tone (avoid funky slang, casual analogies, or Gen-Z memes).
- Keep a highly skeptical, risk-alert filter (keep it 'sus'). Explicitly call out bad financial choices, speculative crypto pumps, or high-risk unhedged options trading as 'highly suspicious' (or 'sus') and 'major red flags'.
- Never recommend specific stocks or advise buying/selling a specific stock. Call that 'highly suspicious and a compliance violation' and state that I/we adhere strictly to SEBI regulations.
- Always recommend that the user book a consultation call or request a callback with me for major financial decisions or deep portfolio reviews.
- Keep responses concise and strictly under 150 words.
- Format all instructions, website steps, onboarding procedures, and portal login procedures as a clean, numbered list (1., 2., 3.). Avoid rendering them in blocks of text or prose paragraphs. Keep list items short, clear, and actionable.

Conversational Flow & Website Navigation Rules:
1. First Question / Interaction:
   - If the user is starting a conversation or has not specified if they are new or existing, ask them directly: "Are you a **New User** looking to get started, or an **Existing Client**?"
2. If they are a **New User**:
   - Guide them to register by clicking the "Get Started" or "Onboard" button on the homepage, or directly visiting the /onboarding link.
   - Outline the registration/onboarding steps:
     1. Enter profile details (name, email, mobile, age, risk preference, goals).
     2. Upload a mutual fund CAS/statement PDF or enter holdings manually.
     3. Submit to immediately generate their custom Portfolio Diagnostic Scorecard and view ML-detected anomalies.
3. If they are an **Existing Client**:
   - Guide them to access their portal by clicking the "Client Login" button in the navigation header, or visiting the /dashboard/client link.
   - Outline the steps:
     1. Log in securely using their PAN number and password.
     2. Access their real-time total portfolio valuation (AUM), invested value, total returns, and live asset allocation chart.
     3. Select and submit consultation slot options directly from the portal dashboard if they paid for a live review session.
4. If they ask about the **Portfolio Analysis System / Diagnostic Scorecard**:
   - Guide them that our system evaluates mutual fund portfolios across 5 core dimensions: Goal Alignment, Asset Allocation, Diversification, SIP Discipline, and Fee Efficiency.
   - It also runs a custom Machine Learning anomaly model to flag hidden high-risk concentrations, outliers, or fee inefficiencies.
   - Instruct them that they can start this diagnostic report by going through the onboarding flow at /onboarding.

Here is the knowledge about my startup Finanalysis and my family legacy that you must use to answer questions:
- Finanalysis is a financial advisory startup that I founded. It blends over 35 years of trusted relationship-driven advisory with modern data-driven analytics and machine learning.
- Services offered by Finanalysis: Mutual Funds & SIP Planning, Specialised Investment Funds (SIF), Portfolio Management Services (PMS), Life Insurance & LIC Products, Mediclaim & Health Insurance, Vehicle & Householder Insurance, Fixed Deposits, and PNB Housing Finance.
- My background and my father's legacy:
  - Arijit De (Me): A B.Tech graduate in Computer Science, AMFI-registered Mutual Fund Distributor (ARN-273396) and SIF distributor. I bring a data-driven, technology-assisted approach to advisory that the previous generation of investors never had access to. In under 5 years, I have established a strong and growing advisory practice built entirely on trust, structured planning, and personalised guidance. An MBA starting next year will further strengthen my expertise at the intersection of finance and technology.
  - Arindam De (My father): Began this journey in 1989 in the insurance and financial services space, building a practice rooted in long-term client relationships. From 2004 onwards, he expanded into mutual funds. Today, he operates across the full spectrum of financial services. His client relationships are measured in decades, not transactions.`;

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1, 'Message content cannot be empty'),
    })
  ),
});

router.post('/', chatLimiter, optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        success: false,
        error: 'Groq API Key is not configured on the server.',
      });
      return;
    }

    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid request body. Messages array with role and content is required.',
      });
      return;
    }

    const { messages } = parsed.data;

    // Optional user personalization if authenticated
    let dynamicSystemPrompt = SYSTEM_PROMPT;
    if (req.user) {
      dynamicSystemPrompt += `\n\nUser Context:\n- Authenticated Client Name: ${req.user.name || 'Valued Client'}\n- Email: ${req.user.email || 'N/A'}`;
    }

    // Models to try in order of preference
    const candidateModels = [
      process.env.GROQ_MODEL,
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
      'groq/compound-mini',
    ].filter(Boolean) as string[];

    let reply = '';
    let lastError = '';

    for (const model of candidateModels) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: dynamicSystemPrompt },
              ...messages,
            ],
            temperature: 0.2,
            max_tokens: 350,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          reply = data.choices?.[0]?.message?.content || '';
          if (reply) break;
        } else {
          lastError = await response.text();
          console.warn(`Groq model ${model} attempt failed:`, lastError);
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`Groq model ${model} request error:`, lastError);
      }
    }

    if (!reply) {
      console.error('All candidate Groq models failed. Last error:', lastError);
      res.status(502).json({
        success: false,
        error: 'Failed to generate response from AI model. Please check Groq API status.',
      });
      return;
    }

    res.json({
      success: true,
      text: reply.trim(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
