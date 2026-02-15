Write a structured JSON object explaining "{{topic}}".

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
- Ensure each level meaningfully expands the previous one.
