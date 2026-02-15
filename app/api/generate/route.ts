import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getDictionary, type Lang } from "@/lib/dictionaries";

const LEVELS = ["beginner", "intermediate", "advanced"] as const;
type Level = (typeof LEVELS)[number];

function normalizeLevel(value: unknown): Level {
  if (typeof value === "string" && LEVELS.includes(value as Level)) {
    return value as Level;
  }
  return "intermediate";
}

function getLevelInstructions(lang: Lang, level: Level) {
  if (lang === "vi") {
    return {
      beginner:
        "Dùng ngôn ngữ rất đơn giản, ưu tiên trực quan, hạn chế thuật ngữ, tập trung ý chính.",
      intermediate:
        "Giải thích cân bằng giữa dễ hiểu và chính xác, dùng một số thuật ngữ và ví dụ thực tế.",
      advanced:
        "Giải thích chuyên sâu với thuật ngữ chính xác, cơ chế chi tiết, sắc thái, giới hạn và đánh đổi.",
    }[level];
  }

  return {
    beginner:
      "Use very simple language, avoid jargon, and focus on core ideas with intuitive examples.",
    intermediate:
      "Use a balanced style with moderate technical detail, clear term definitions, and practical examples.",
    advanced:
      "Use precise technical language with deeper mechanisms, nuanced distinctions, limitations, and tradeoffs.",
  }[level];
}

export async function POST(request: NextRequest) {
  try {
    const { topic, lang, level } = (await request.json()) as {
      topic: string;
      lang: string;
      level?: string;
    };

    if (!topic || !lang) {
      return NextResponse.json(
        { error: "Missing topic or lang" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const dict = getDictionary(lang as Lang);
    const safeLang = (lang === "vi" ? "vi" : "en") as Lang;
    const selectedLevel = normalizeLevel(level);
    const levelInstruction = getLevelInstructions(safeLang, selectedLevel);

    const prompt = dict.prompt
      .replaceAll("{{topic}}", topic)
      .replaceAll("{{level_instruction}}", levelInstruction);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const essay = completion.choices[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ essay });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to generate essay" },
      { status: 500 }
    );
  }
}
