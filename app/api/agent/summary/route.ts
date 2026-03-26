import { NextResponse } from "next/server";
import { lookupCptCode } from "../../../../lib/pfsData";
import { buildCmsSource } from "../../../../lib/sourceBundle";
import { buildQuestionsPrompt, buildSummaryPrompt } from "../../../../lib/agentPrompts";
import { getCachedSummary, hashSources, saveCachedSummary } from "../../../../lib/agentCache";

export const runtime = "nodejs";

const OPENAI_MODEL = "gpt-4o-mini";

const fallbackSummary = (description: string | null) => {
  const safeDesc = description ?? "this procedure";
  return [
    `CMS describes this code as “${safeDesc}.” [1]`,
    "This is a billing label for care tied to that service; your provider can explain the exact steps performed. [1]",
    "Ask how it connects to your diagnosis and what follow-up care is expected. [1]"
  ].join(" ");
};

const fallbackQuestions = () => {
  return [
    "What exact service does this code represent for my visit? [1]",
    "Is any part of this care bundled into another code? [1]",
    "What follow-up care is usually expected for this service? [1]"
  ];
};

const callOpenAi = async (prompt: string) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: prompt,
      temperature: 0.2,
      max_output_tokens: 220
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${text}`);
  }

  const data = await response.json();
  const outputText = data?.output_text ?? "";
  return outputText.trim();
};

const parseQuestions = (text: string) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*\\d.\\s]+/, "").trim())
    .filter(Boolean);
  return lines.slice(0, 3);
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!code) {
    return NextResponse.json({ error: "Missing CPT code." }, { status: 400 });
  }

  const record = lookupCptCode(code);
  if (!record) {
    return NextResponse.json({ error: "CPT code not found." }, { status: 404 });
  }

  const sources = [buildCmsSource(code, record.description, record.globalDays)];
  const sourceHash = hashSources(sources);
  const cached = getCachedSummary(code);

  if (cached && cached.sourceHash === sourceHash) {
    return NextResponse.json({ summary: cached.summary, questions: cached.questions, sources: cached.sources, cached: true });
  }

  const summaryPrompt = buildSummaryPrompt({ code, sources });
  const questionsPrompt = buildQuestionsPrompt({ code, sources });

  let summary = fallbackSummary(record.description);
  let questions = fallbackQuestions();
  let usedModel = false;

  try {
    const summaryText = await callOpenAi(summaryPrompt);
    const questionsText = await callOpenAi(questionsPrompt);
    if (summaryText) {
      summary = summaryText;
    }
    const parsed = parseQuestions(questionsText);
    if (parsed.length) {
      questions = parsed;
    }
    usedModel = true;
  } catch {
    usedModel = false;
  }

  saveCachedSummary({
    code,
    summary,
    questions,
    sourceHash,
    updatedAt: new Date().toISOString(),
    sources
  });

  return NextResponse.json({
    summary,
    questions,
    sources,
    cached: false,
    usedModel
  });
}
