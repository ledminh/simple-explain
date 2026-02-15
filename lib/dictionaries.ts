export type Lang = "en" | "vi";

export interface Dictionary {
  meta: {
    title: string;
    description: string;
  };
  header: {
    logo: string;
    tagline: string;
  };
  input: {
    heading: string;
    subtitle: string;
    placeholder: string;
    generateBtn: string;
    levelLabel: string;
    beginnerLevel: string;
    intermediateLevel: string;
    advancedLevel: string;
  };
  recent: {
    heading: string;
    exportBtn: string;
    empty: string;
  };
  loading: {
    text: string;
  };
  article: {
    newTopic: string;
    fontSizeTitle: string;
    printTitle: string;
    minRead: string;
    footer: string;
    titlePrefix: string;
  };
  prompt: string;
  errorMessage: string;
}

const en: Dictionary = {
  meta: {
    title: "Simple Explain - Learn Anything Simply",
    description: "Complex topics, explained simply",
  },
  header: {
    logo: "📚 Simple Explain",
    tagline: "Complex topics, explained simply",
  },
  input: {
    heading: "What would you like to learn about?",
    subtitle: "Enter any topic and get a clear, simple explanation",
    placeholder: "e.g., Quantum Physics, Blockchain, Photosynthesis...",
    generateBtn: "Generate Explanation",
    levelLabel: "Explanation level",
    beginnerLevel: "Beginner",
    intermediateLevel: "Intermediate",
    advancedLevel: "Advanced",
  },
  recent: {
    heading: "Recent searches",
    exportBtn: "EXPORT",
    empty: "No recent searches yet.",
  },
  loading: {
    text: "Crafting your explanation...",
  },
  article: {
    newTopic: "← New Topic",
    fontSizeTitle: "Adjust font size",
    printTitle: "Print article",
    minRead: "min read",
    footer: "Generated with ✨ by Simple Explain",
    titlePrefix: "Understanding",
  },
  prompt: `Write a short essay around 500 words explaining "{{topic}}".
Follow this level instruction:
* Level: {{level_instruction}}
Structure the essay so that each paragraph builds logically on the previous one.
* The first paragraph should introduce the most basic and foundational idea.
* Each following paragraph should gradually add slightly more depth and complexity.
* Move step by step from simple concepts to more abstract or advanced ones.
Use examples when helpful, and define important terms at a level suitable for the selected profile.
Write in plain text only. Do not use any markdown formatting (no headers, bold, italic, bullet points, or numbered lists). Use only paragraphs separated by blank lines.`,
  errorMessage: "Failed to generate the explanation. Please try again.",
};

const vi: Dictionary = {
  meta: {
    title: "Giải Thích Đơn Giản - Học Mọi Thứ Một Cách Đơn Giản",
    description: "Chủ đề phức tạp, giải thích đơn giản",
  },
  header: {
    logo: "📚 Giải Thích Đơn Giản",
    tagline: "Chủ đề phức tạp, giải thích đơn giản",
  },
  input: {
    heading: "Bạn muốn tìm hiểu về điều gì?",
    subtitle: "Nhập bất kỳ chủ đề nào và nhận giải thích rõ ràng, đơn giản",
    placeholder: "VD: Vật lý lượng tử, Blockchain, Quang hợp...",
    generateBtn: "Tạo Giải Thích",
    levelLabel: "Mức độ giải thích",
    beginnerLevel: "Cơ bản",
    intermediateLevel: "Trung cấp",
    advancedLevel: "Nâng cao",
  },
  recent: {
    heading: "Tìm kiếm gần đây",
    exportBtn: "EXPORT",
    empty: "Chưa có tìm kiếm gần đây.",
  },
  loading: {
    text: "Đang soạn giải thích cho bạn...",
  },
  article: {
    newTopic: "← Chủ Đề Mới",
    fontSizeTitle: "Điều chỉnh cỡ chữ",
    printTitle: "In bài viết",
    minRead: "phút đọc",
    footer: "Được tạo bởi ✨ Giải Thích Đơn Giản",
    titlePrefix: "Tìm Hiểu Về",
  },
  prompt: `Viết một bài luận ngắn khoảng 500 từ giải thích "{{topic}}".
Tuân theo mức độ giải thích sau:
* Mức độ: {{level_instruction}}
Cấu trúc bài luận sao cho mỗi đoạn văn xây dựng logic trên đoạn trước.
* Đoạn đầu tiên nên giới thiệu ý tưởng cơ bản và nền tảng nhất.
* Mỗi đoạn tiếp theo dần dần thêm chiều sâu và độ phức tạp.
* Di chuyển từng bước từ khái niệm đơn giản đến trừu tượng hoặc nâng cao hơn.
Sử dụng ví dụ khi cần và giải thích thuật ngữ theo đúng mức cấu hình đã chọn.
Viết bằng tiếng Việt. Chỉ viết văn bản thuần túy. Không sử dụng định dạng markdown (không tiêu đề, in đậm, in nghiêng, gạch đầu dòng, hoặc danh sách đánh số). Chỉ sử dụng các đoạn văn cách nhau bằng dòng trống.`,
  errorMessage: "Không thể tạo giải thích. Vui lòng thử lại.",
};

const dictionaries: Record<Lang, Dictionary> = { en, vi };

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang] || dictionaries.en;
}

export const locales: Lang[] = ["en", "vi"];
