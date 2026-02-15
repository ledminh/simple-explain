import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getDictionary, type Lang } from "@/lib/dictionaries";

export const runtime = "nodejs";

type LessonPayload = {
  schema_version: string;
  topic: string;
  lesson: {
    beginner: string;
    intermediate: string;
    advance: string;
  };
};

const PROMPT_TEMPLATES: Record<Lang, string> = {
  en: `Write a structured JSON object explaining "{{topic}}".

GOAL

Generate a progressive three-level explanation that develops from fundamental understanding to deeper and more abstract insight. The topic may belong to any field such as science, philosophy, economics, psychology, history, art, technology, or general knowledge.

OUTPUT RULES (CRITICAL)

- Output ONLY valid JSON.
- Do NOT include markdown, comments, explanations, or backticks.
- The result must be directly parseable by JSON.parse().
- No trailing commas.
- Do NOT include double quote characters inside any string values.
- Do NOT include backslashes inside string values.
- Do NOT include raw newline characters.
- Separate paragraphs using escaped newline sequences: "\\n\\n"

JSON STRUCTURE

{
"schema_version": "1.0",
"topic": "{{topic}}",
"lesson": {
"beginner": string,
"intermediate": string,
"advance": string
}
}

CONTENT REQUIREMENTS

The "lesson" field must contain exactly three levels:

beginner

- 400–600 words.
- At least 3 logical paragraphs separated by "\\n\\n".
- Introduce the most basic and foundational idea first.
- Define important terms clearly.
- Use simple language appropriate for: {{level_instruction}}.
- Use examples when helpful.
- Focus on core intuition and mental models.

intermediate

- 400–600 words.
- At least 3 logical paragraphs separated by "\\n\\n".
- Build directly on the beginner explanation.
- Introduce more precise terminology and deeper relationships.
- Explore causes, mechanisms, patterns, or implications.
- Increase conceptual depth gradually.

advance

- 400–600 words.
- At least 3 logical paragraphs separated by "\\n\\n".
- Build on the intermediate explanation.
- Explore abstraction, trade-offs, edge cases, broader implications, or theoretical perspectives depending on the topic.
- Connect the topic to larger frameworks, debates, or real-world consequences.
- Emphasize structured reasoning and deeper insight.

GENERAL WRITING RULES

- Plain text only.
- No markdown formatting.
- No headings.
- No bullet points.
- No numbered lists.
- Maintain logical progression across levels.
- Avoid repeating the same explanation verbatim.
- Ensure each level meaningfully expands the previous one.`,
  vi: `Tạo một đối tượng JSON có cấu trúc để giải thích "{{topic}}".

MỤC TIÊU

Tạo phần giải thích gồm ba mức độ, phát triển từ hiểu biết nền tảng đến phân tích sâu và trừu tượng hơn. Chủ đề có thể thuộc bất kỳ lĩnh vực nào như khoa học, triết học, kinh tế, tâm lý học, lịch sử, nghệ thuật, công nghệ, hoặc kiến thức tổng quát.

QUY TẮC ĐẦU RA (RẤT QUAN TRỌNG)

- Chỉ xuất ra JSON hợp lệ.
- Không thêm markdown, chú thích, giải thích, hoặc ký hiệu backtick.
- Kết quả phải parse được bằng JSON.parse() mà không cần chỉnh sửa.
- Không có dấu phẩy thừa.
- Không sử dụng dấu ngoặc kép bên trong bất kỳ giá trị chuỗi nào.
- Không sử dụng ký tự backslash.
- Không sử dụng xuống dòng thật.
- Phân tách đoạn văn bằng chuỗi "\\n\\n".

CẤU TRÚC JSON

{
"schema_version": "1.0",
"topic": "{{topic}}",
"lesson": {
"beginner": string,
"intermediate": string,
"advance": string
}
}

YÊU CẦU NỘI DUNG

Trường "lesson" phải có đúng ba mức:

beginner

- 400–600 từ.
- Ít nhất 3 đoạn văn, phân tách bằng "\\n\\n".
- Bắt đầu bằng ý tưởng cơ bản và nền tảng nhất.
- Giải thích rõ các thuật ngữ quan trọng.
- Sử dụng ngôn ngữ phù hợp với mức: {{level_instruction}}.
- Dùng ví dụ khi cần.
- Tập trung vào trực giác và mô hình tư duy cơ bản.

intermediate

- 400–600 từ.
- Ít nhất 3 đoạn văn, phân tách bằng "\\n\\n".
- Xây dựng trực tiếp trên phần beginner.
- Giới thiệu thuật ngữ chính xác hơn và mối quan hệ sâu hơn.
- Phân tích nguyên nhân, cơ chế, hoặc hệ quả.
- Tăng dần độ sâu tư duy.

advance

- 400–600 từ.
- Ít nhất 3 đoạn văn, phân tách bằng "\\n\\n".
- Xây dựng trên phần intermediate.
- Phân tích mức trừu tượng cao hơn, đánh đổi, trường hợp đặc biệt, hoặc tác động rộng hơn tùy theo chủ đề.
- Kết nối chủ đề với khung tư duy lớn hơn hoặc hệ quả thực tế.
- Nhấn mạnh tư duy có cấu trúc và chiều sâu.

QUY TẮC VIẾT CHUNG

- Chỉ sử dụng văn bản thuần túy.
- Không dùng markdown.
- Không tiêu đề.
- Không gạch đầu dòng.
- Không danh sách đánh số.
- Duy trì sự phát triển logic giữa các mức.
- Không lặp lại nguyên văn cùng một nội dung giữa các mức.
- Mỗi mức phải mở rộng ý nghĩa và chiều sâu so với mức trước.`,
};

const DEFAULT_LEVEL_INSTRUCTION: Record<Lang, string> = {
  en: "general audience with clear, plain language and practical examples",
  vi: "đối tượng phổ thông, ngôn ngữ rõ ràng, dễ hiểu, có ví dụ thực tế",
};

function cleanModelOutput(raw: string): string {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateLessonPayload(value: unknown): LessonPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const parsed = value as {
    schema_version?: unknown;
    topic?: unknown;
    lesson?: {
      beginner?: unknown;
      intermediate?: unknown;
      advance?: unknown;
    };
  };

  if (!isNonEmptyString(parsed.schema_version) || !isNonEmptyString(parsed.topic)) {
    return null;
  }

  if (!parsed.lesson || typeof parsed.lesson !== "object") {
    return null;
  }

  const { beginner, intermediate, advance } = parsed.lesson;
  if (!isNonEmptyString(beginner) || !isNonEmptyString(intermediate) || !isNonEmptyString(advance)) {
    return null;
  }

  return {
    schema_version: parsed.schema_version,
    topic: parsed.topic,
    lesson: {
      beginner,
      intermediate,
      advance,
    },
  };
}

async function generateStructuredLesson(
  openai: OpenAI,
  prompt: string
): Promise<LessonPayload> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 5200,
    response_format: { type: "json_object" },
  });

  const rawContent = completion.choices[0]?.message?.content;
  if (!rawContent || rawContent.trim().length === 0) {
    throw new Error("Model returned empty content");
  }

  const cleanedOutput = cleanModelOutput(rawContent);
  const parsedOutput = JSON.parse(cleanedOutput) as unknown;
  const validatedPayload = validateLessonPayload(parsedOutput);

  if (!validatedPayload) {
    throw new Error("Model returned invalid lesson JSON");
  }

  return validatedPayload;
}

export async function POST(request: NextRequest) {
  let safeLang: Lang = "en";

  try {
    const { topic, lang } = (await request.json()) as {
      topic?: string;
      lang?: string;
    };

    const normalizedTopic = topic?.trim();
    safeLang = lang === "vi" ? "vi" : "en";

    if (!normalizedTopic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const promptTemplate = PROMPT_TEMPLATES[safeLang];
    const prompt = promptTemplate
      .replaceAll("{{topic}}", normalizedTopic)
      .replaceAll(
        "{{level_instruction}}",
        DEFAULT_LEVEL_INSTRUCTION[safeLang]
      );

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const lessonPayload = await generateStructuredLesson(openai, prompt);

    return NextResponse.json({ lesson: lessonPayload });
  } catch (error) {
    console.error("OpenAI API error:", error);

    return NextResponse.json(
      { error: getDictionary(safeLang).errorMessage },
      { status: 500 }
    );
  }
}
