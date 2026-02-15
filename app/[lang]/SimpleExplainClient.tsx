"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ClientDict {
  input: {
    heading: string;
    subtitle: string;
    placeholder: string;
    generateBtn: string;
    hint: string;
  };
  recent: {
    heading: string;
    exportBtn: string;
    empty: string;
  };
  loading: {
    text: string;
  };
  lesson: {
    beginnerLabel: string;
    intermediateLabel: string;
    advanceLabel: string;
    generatedOn: string;
    totalWords: string;
    wordsSuffix: string;
    continueToNext: string;
    finalLevel: string;
  };
  article: {
    newTopic: string;
    fontSizeTitle: string;
    printTitle: string;
    footer: string;
    titlePrefix: string;
  };
  errorMessage: string;
}

type Section = "input" | "loading" | "lesson";
type LessonLevel = "beginner" | "intermediate" | "advance";

interface StructuredLesson {
  schema_version: string;
  topic: string;
  lesson: {
    beginner: string;
    intermediate: string;
    advance: string;
  };
}

interface LessonViewLevel {
  key: LessonLevel;
  label: string;
  wordCount: number;
  paragraphs: string[];
}

interface LessonViewData {
  title: string;
  generatedDate: string;
  totalWords: number;
  schemaVersion: string;
  levels: LessonViewLevel[];
}

interface RecentSearchItem {
  topic: string;
  searchedAt: string;
  lesson?: StructuredLesson;
}

interface RecentSearchInput {
  topic: string;
  lesson?: StructuredLesson;
}

const LEVEL_ORDER: LessonLevel[] = ["beginner", "intermediate", "advance"];
const fontSizeClasses = ["font-small", "font-medium", "font-large"];
const RECENT_SEARCHES_STORAGE_KEY = "simple-explain-recent-searches-v2";
const LEGACY_STORAGE_KEY = "simple-explain-recent-searches-v1";
const MAX_RECENT_SEARCHES = 10;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeLesson(value: unknown): StructuredLesson | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as {
    schema_version?: unknown;
    topic?: unknown;
    lesson?: {
      beginner?: unknown;
      intermediate?: unknown;
      advance?: unknown;
    };
  };

  if (!isNonEmptyString(candidate.schema_version) || !isNonEmptyString(candidate.topic)) {
    return null;
  }

  if (!candidate.lesson || typeof candidate.lesson !== "object") {
    return null;
  }

  const beginner = candidate.lesson.beginner;
  const intermediate = candidate.lesson.intermediate;
  const advance = candidate.lesson.advance;

  if (!isNonEmptyString(beginner) || !isNonEmptyString(intermediate) || !isNonEmptyString(advance)) {
    return null;
  }

  return {
    schema_version: candidate.schema_version,
    topic: candidate.topic,
    lesson: {
      beginner,
      intermediate,
      advance,
    },
  };
}

function normalizeRecentSearchItem(value: unknown): RecentSearchItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as {
    topic?: unknown;
    searchedAt?: unknown;
    lesson?: unknown;
  };

  if (!isNonEmptyString(candidate.topic)) {
    return null;
  }

  const searchedAt =
    typeof candidate.searchedAt === "string" &&
    !Number.isNaN(new Date(candidate.searchedAt).getTime())
      ? candidate.searchedAt
      : new Date().toISOString();

  const lesson = normalizeLesson(candidate.lesson);

  return {
    topic: candidate.topic.trim(),
    searchedAt,
    lesson: lesson ?? undefined,
  };
}

function readRecentSearchStore(): Record<string, RecentSearchItem[]> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue =
      window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!parsedValue || typeof parsedValue !== "object") {
      return {};
    }

    const parsedStore = parsedValue as Record<string, unknown>;
    const safeStore: Record<string, RecentSearchItem[]> = {};

    for (const [language, entries] of Object.entries(parsedStore)) {
      if (!Array.isArray(entries)) {
        continue;
      }

      safeStore[language] = entries
        .map((entry) => normalizeRecentSearchItem(entry))
        .filter((entry): entry is RecentSearchItem => entry !== null)
        .slice(0, MAX_RECENT_SEARCHES);
    }

    return safeStore;
  } catch {
    return {};
  }
}

function writeRecentSearchStore(store: Record<string, RecentSearchItem[]>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Intentionally ignore localStorage write errors.
  }
}

function toDisplayParagraphs(value: string): string[] {
  const normalized = value.replace(/\\n/g, "\n").trim();
  return normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export default function SimpleExplainClient({
  dict,
  lang,
}: {
  dict: ClientDict;
  lang: string;
}) {
  const [section, setSection] = useState<Section>("input");
  const [topic, setTopic] = useState("");
  const [lessonData, setLessonData] = useState<LessonViewData | null>(null);
  const [activeLevel, setActiveLevel] = useState<LessonLevel>("beginner");
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const canGenerate = topic.trim().length > 0;
  const dateLocale = lang === "vi" ? "vi-VN" : "en-US";

  const levelLabelMap: Record<LessonLevel, string> = {
    beginner: dict.lesson.beginnerLabel,
    intermediate: dict.lesson.intermediateLabel,
    advance: dict.lesson.advanceLabel,
  };

  useEffect(() => {
    const store = readRecentSearchStore();
    setRecentSearches(store[lang] ?? []);
  }, [lang]);

  const createLessonView = useCallback(
    (lesson: StructuredLesson, generatedAtIso: string): LessonViewData => {
      const generatedDate = new Date(generatedAtIso).toLocaleDateString(dateLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const levels: LessonViewLevel[] = LEVEL_ORDER.map((levelKey) => {
        const text = lesson.lesson[levelKey];
        return {
          key: levelKey,
          label: levelLabelMap[levelKey],
          wordCount: countWords(text),
          paragraphs: toDisplayParagraphs(text),
        };
      });

      const totalWords = levels.reduce((sum, level) => sum + level.wordCount, 0);

      return {
        title: lesson.topic,
        generatedDate,
        totalWords,
        schemaVersion: lesson.schema_version,
        levels,
      };
    },
    [dateLocale, levelLabelMap]
  );

  const saveRecentSearch = useCallback(
    (entryData: RecentSearchInput) => {
      const normalizedTopic = entryData.topic.trim();
      if (!normalizedTopic) {
        return;
      }

      const store = readRecentSearchStore();
      const currentLangSearches = store[lang] ?? [];

      const deduplicated = currentLangSearches.filter(
        (item) => item.topic.toLocaleLowerCase(dateLocale) !== normalizedTopic.toLocaleLowerCase(dateLocale)
      );

      const nextSearches = [
        {
          topic: normalizedTopic,
          searchedAt: new Date().toISOString(),
          lesson: entryData.lesson,
        },
        ...deduplicated,
      ].slice(0, MAX_RECENT_SEARCHES);

      store[lang] = nextSearches;
      writeRecentSearchStore(store);
      setRecentSearches(nextSearches);
    },
    [dateLocale, lang]
  );

  const formatRecentSearchDate = useCallback(
    (isoDate: string) => {
      const parsedDate = new Date(isoDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return "";
      }

      return parsedDate.toLocaleString(dateLocale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    },
    [dateLocale]
  );

  const sanitizeFileName = useCallback((value: string) => {
    const base = value
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60);

    return base || "lesson";
  }, []);

  const downloadFile = useCallback((fileName: string, content: string, type: string) => {
    const blob = new Blob([content], {
      type,
    });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }, []);

  const exportRecentSearchEntry = useCallback(
    (entry: RecentSearchItem, index: number) => {
      const searchedAtDate = new Date(entry.searchedAt);
      const fileDate = Number.isNaN(searchedAtDate.getTime())
        ? new Date().toISOString().slice(0, 10)
        : searchedAtDate.toISOString().slice(0, 10);

      const exportPayload = entry.lesson ?? {
        schema_version: "1.0",
        topic: entry.topic,
        lesson: {
          beginner: "",
          intermediate: "",
          advance: "",
        },
      };

      const safeTopic = sanitizeFileName(entry.topic);
      const fileName = `simple-explain-${lang}-${String(index + 1).padStart(2, "0")}-${fileDate}-${safeTopic}.json`;
      downloadFile(fileName, JSON.stringify(exportPayload, null, 2), "application/json;charset=utf-8");
    },
    [downloadFile, lang, sanitizeFileName]
  );

  const handleGenerate = useCallback(
    async (topicValue?: string) => {
      const trimmedTopic = (topicValue ?? topic).trim();
      if (!trimmedTopic) {
        inputRef.current?.focus();
        return;
      }

      setSection("loading");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: trimmedTopic,
            lang,
          }),
        });

        if (!res.ok) {
          throw new Error("API request failed");
        }

        const data = (await res.json()) as { lesson?: unknown };
        const structuredLesson = normalizeLesson(data.lesson);

        if (!structuredLesson) {
          throw new Error("Invalid response shape");
        }

        const generatedAt = new Date().toISOString();

        setLessonData(createLessonView(structuredLesson, generatedAt));
        setActiveLevel("beginner");
        saveRecentSearch({
          topic: structuredLesson.topic || trimmedTopic,
          lesson: structuredLesson,
        });
        setSection("lesson");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        alert(dict.errorMessage);
        setSection("input");
      }
    },
    [createLessonView, dict.errorMessage, lang, saveRecentSearch, topic]
  );

  const openRecentSearch = useCallback(
    (entry: RecentSearchItem) => {
      setTopic(entry.topic);

      if (!entry.lesson) {
        // Backward compatibility for old entries without structured payload.
        handleGenerate(entry.topic);
        return;
      }

      setLessonData(createLessonView(entry.lesson, entry.searchedAt));
      setActiveLevel("beginner");
      setSection("lesson");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [createLessonView, handleGenerate]
  );

  const handleNewTopic = () => {
    setSection("input");
    setTopic("");
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const toggleFontSize = () => {
    const next = (fontSizeIndex + 1) % 3;
    setFontSizeIndex(next);
    document.body.classList.remove(...fontSizeClasses);
    document.body.classList.add(fontSizeClasses[next]);
  };

  const handlePrint = () => window.print();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGenerate();
    }
  };

  const currentLevel =
    lessonData?.levels.find((level) => level.key === activeLevel) ??
    lessonData?.levels[0] ??
    null;
  const currentLevelIndex = currentLevel
    ? LEVEL_ORDER.indexOf(currentLevel.key)
    : -1;
  const nextLevelKey =
    currentLevelIndex >= 0 && currentLevelIndex < LEVEL_ORDER.length - 1
      ? LEVEL_ORDER[currentLevelIndex + 1]
      : null;
  const nextLevelLabel = nextLevelKey ? levelLabelMap[nextLevelKey] : null;

  const handleContinueToNext = () => {
    if (!nextLevelKey) {
      return;
    }
    setActiveLevel(nextLevelKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (section === "loading") {
    return (
      <section className="loading-section" role="status" aria-live="polite">
        <div className="loading-card paper-card">
          <div className="book-loader">
            <div className="book">
              <div className="page" />
              <div className="page" />
              <div className="page" />
            </div>
          </div>
          <p className="loading-text">{dict.loading.text}</p>
        </div>
      </section>
    );
  }

  if (section === "lesson" && lessonData) {
    return (
      <section className="article-section">
        <div className="article-controls">
          <button className="control-btn" type="button" onClick={handleNewTopic}>
            {dict.article.newTopic}
          </button>
          <div className="reading-tools">
            <button
              className="tool-btn"
              type="button"
              title={dict.article.fontSizeTitle}
              aria-label={dict.article.fontSizeTitle}
              onClick={toggleFontSize}
            >
              <span className="font-size-indicator">T</span>
              <span>{dict.article.fontSizeTitle}</span>
            </button>
            <button
              className="tool-btn"
              type="button"
              title={dict.article.printTitle}
              aria-label={dict.article.printTitle}
              onClick={handlePrint}
            >
              <span className="tool-icon" aria-hidden="true">
                🖨
              </span>
              <span>{dict.article.printTitle}</span>
            </button>
          </div>
        </div>

        <article className="blog-post paper-card">
          <header className="post-header">
            <h1 className="post-title">{lessonData.title}</h1>
            <div className="title-decoration" />
            <div className="post-meta post-meta-grid">
              <span className="post-meta-chip">
                {dict.lesson.generatedOn}: {lessonData.generatedDate}
              </span>
              <span className="post-meta-chip">
                {dict.lesson.totalWords}: {lessonData.totalWords} {dict.lesson.wordsSuffix}
              </span>
            </div>
          </header>

          <div className="level-jump-nav" role="navigation" aria-label="Lesson levels">
            {lessonData.levels.map((level) => (
              <button
                key={`jump-${level.key}`}
                type="button"
                className={`level-jump-btn ${activeLevel === level.key ? "active" : ""}`}
                onClick={() => setActiveLevel(level.key)}
              >
                {level.label}
              </button>
            ))}
          </div>

          <div className="article-divider" />

          {currentLevel ? (
            <section className="lesson-level">
              <div className="lesson-level-head">
                <h2 className="lesson-level-title">{currentLevel.label}</h2>
                <span className="lesson-level-words">
                  {currentLevel.wordCount} {dict.lesson.wordsSuffix}
                </span>
              </div>
              <div className="post-content">
                {currentLevel.paragraphs.map((paragraph, index) => (
                  <p key={`${currentLevel.key}-paragraph-${index}`}>{paragraph}</p>
                ))}
              </div>
              <div className="lesson-level-footer">
                {nextLevelLabel ? (
                  <button
                    type="button"
                    className="continue-btn"
                    onClick={handleContinueToNext}
                  >
                    {dict.lesson.continueToNext} {nextLevelLabel}
                  </button>
                ) : (
                  <p className="final-level-text">{dict.lesson.finalLevel}</p>
                )}
              </div>
            </section>
          ) : null}

          <footer className="post-footer">
            <div className="article-divider" />
            <p className="footer-text">{dict.article.footer}</p>
          </footer>
        </article>
      </section>
    );
  }

  return (
    <section className="input-section">
      <div className="input-card paper-card">
        <h2>{dict.input.heading}</h2>
        <p className="subtitle">{dict.input.subtitle}</p>

        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            className="topic-input"
            placeholder={dict.input.placeholder}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
          />
          <button
            className="generate-btn"
            type="button"
            onClick={() => handleGenerate()}
            disabled={!canGenerate}
          >
            <span className="btn-text">{dict.input.generateBtn}</span>
            <span className="btn-icon">+</span>
          </button>
        </div>

        <p className="input-hint">{dict.input.hint}</p>

        <section className="recent-searches">
          <div className="recent-searches-header">
            <h3 className="recent-searches-title">{dict.recent.heading}</h3>
          </div>

          {recentSearches.length === 0 ? (
            <p className="recent-searches-empty">{dict.recent.empty}</p>
          ) : (
            <ul className="recent-searches-list">
              {recentSearches.map((entry, index) => (
                <li key={`${entry.topic}-${entry.searchedAt}`} className="recent-searches-item">
                  <div className="recent-searches-main">
                    <span className="recent-searches-index">{index + 1}.</span>
                    <button
                      className="recent-searches-topic-btn"
                      type="button"
                      onClick={() => {
                        openRecentSearch(entry);
                      }}
                    >
                      {entry.topic}
                    </button>
                  </div>
                  <div className="recent-searches-side">
                    <span className="recent-searches-date">
                      {formatRecentSearchDate(entry.searchedAt)}
                    </span>
                    <button
                      className="recent-item-export-btn"
                      type="button"
                      onClick={() => exportRecentSearchEntry(entry, index)}
                    >
                      {dict.recent.exportBtn}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
