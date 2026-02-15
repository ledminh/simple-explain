"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ClientDict {
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
  errorMessage: string;
}

type Section = "input" | "loading" | "article";
type Level = "beginner" | "intermediate" | "advanced";

const fontSizeClasses = ["font-small", "font-medium", "font-large"];
const RECENT_SEARCHES_STORAGE_KEY = "simple-explain-recent-searches-v1";
const MAX_RECENT_SEARCHES = 10;

interface RecentSearchItem {
  topic: string;
  searchedAt: string;
  title?: string;
  readingTime?: string;
  generatedDate?: string;
  essay?: string;
}

interface RecentSearchInput {
  topic: string;
  title?: string;
  readingTime?: string;
  generatedDate?: string;
  essay?: string;
}

function normalizeRecentSearchItem(value: unknown): RecentSearchItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as {
    topic?: unknown;
    searchedAt?: unknown;
    title?: unknown;
    readingTime?: unknown;
    generatedDate?: unknown;
    essay?: unknown;
  };
  if (typeof candidate.topic !== "string") {
    return null;
  }

  const topic = candidate.topic.trim();
  if (!topic) {
    return null;
  }

  const searchedAt =
    typeof candidate.searchedAt === "string" &&
    !Number.isNaN(new Date(candidate.searchedAt).getTime())
      ? candidate.searchedAt
      : new Date().toISOString();

  const title = typeof candidate.title === "string" ? candidate.title : undefined;
  const readingTime =
    typeof candidate.readingTime === "string" ? candidate.readingTime : undefined;
  const generatedDate =
    typeof candidate.generatedDate === "string" ? candidate.generatedDate : undefined;
  const essay = typeof candidate.essay === "string" ? candidate.essay : undefined;

  return { topic, searchedAt, title, readingTime, generatedDate, essay };
}

function readRecentSearchStore(): Record<string, RecentSearchItem[]> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
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

export default function SimpleExplainClient({
  dict,
  lang,
}: {
  dict: ClientDict;
  lang: string;
}) {
  const [section, setSection] = useState<Section>("input");
  const [topic, setTopic] = useState("");
  const [articleData, setArticleData] = useState<{
    title: string;
    date: string;
    readingTime: string;
    paragraphs: string[];
  } | null>(null);
  const [explanationLevel, setExplanationLevel] =
    useState<Level>("intermediate");
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const canGenerate = topic.trim().length > 0;
  const dateLocale = lang === "vi" ? "vi-VN" : "en-US";

  useEffect(() => {
    const store = readRecentSearchStore();
    setRecentSearches(store[lang] ?? []);
  }, [lang]);

  const levelOptions: { value: Level; label: string }[] = [
    { value: "beginner", label: dict.input.beginnerLevel },
    { value: "intermediate", label: dict.input.intermediateLevel },
    { value: "advanced", label: dict.input.advancedLevel },
  ];

  const saveRecentSearch = useCallback(
    (entryData: RecentSearchInput) => {
      const normalizedTopic = entryData.topic.trim();
      if (!normalizedTopic) {
        return;
      }

      const store = readRecentSearchStore();
      const currentLangSearches = store[lang] ?? [];

      const deduplicated = currentLangSearches.filter(
        (item) =>
          item.topic.toLocaleLowerCase(dateLocale) !==
          normalizedTopic.toLocaleLowerCase(dateLocale)
      );

      const nextSearches = [
        {
          topic: normalizedTopic,
          searchedAt: new Date().toISOString(),
          title: entryData.title,
          readingTime: entryData.readingTime,
          generatedDate: entryData.generatedDate,
          essay: entryData.essay,
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

    return base || "post";
  }, []);

  const downloadTextFile = useCallback((fileName: string, content: string) => {
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
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
      const lines = [
        entry.title ?? `${dict.article.titlePrefix} ${entry.topic}`,
        "",
        entry.readingTime ?? "",
        entry.generatedDate ?? "",
        "",
        entry.essay ?? entry.topic,
      ].filter((line, lineIndex, arr) => {
        if (line !== "") {
          return true;
        }
        // Keep at most one consecutive empty line.
        return lineIndex === 0 || arr[lineIndex - 1] !== "";
      });

      const safeTopic = sanitizeFileName(entry.topic);
      const fileName = `simple-explain-${lang}-${String(index + 1).padStart(2, "0")}-${fileDate}-${safeTopic}.txt`;
      downloadTextFile(fileName, lines.join("\n"));
    },
    [dict.article.titlePrefix, downloadTextFile, lang, sanitizeFileName]
  );

  const handleGenerate = useCallback(
    async (topicValue?: string) => {
      const t = (topicValue ?? topic).trim();
      if (!t) {
        inputRef.current?.focus();
        return;
      }

      setSection("loading");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: t,
            lang,
            level: explanationLevel,
          }),
        });

        if (!res.ok) {
          throw new Error("API request failed");
        }

        const data = await res.json();
        const essay: string = data.essay;

        const paragraphs = essay.split("\n\n").filter((p) => p.trim());
        const wordCount = essay.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / 200);
        const today = new Date();
        const dateStr = today.toLocaleDateString(dateLocale, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const readingTime = `${minutes} ${dict.article.minRead}`;
        const title = `${dict.article.titlePrefix} ${t}`;
        const essayText = paragraphs.join("\n\n");

        setArticleData({
          title,
          date: dateStr,
          readingTime,
          paragraphs,
        });
        saveRecentSearch({
          topic: t,
          title,
          readingTime,
          generatedDate: dateStr,
          essay: essayText,
        });
        setSection("article");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        alert(dict.errorMessage);
        setSection("input");
      }
    },
    [
      topic,
      dict,
      dateLocale,
      explanationLevel,
      lang,
      saveRecentSearch,
    ]
  );

  const openRecentSearch = useCallback(
    (entry: RecentSearchItem) => {
      setTopic(entry.topic);

      const essayText = entry.essay?.trim();
      if (!essayText) {
        // Backward compatibility for older localStorage entries without cached content.
        handleGenerate(entry.topic);
        return;
      }

      const paragraphs = essayText.split("\n\n").filter((p) => p.trim());
      const wordCount = essayText.split(/\s+/).filter(Boolean).length;
      const parsedSearchDate = new Date(entry.searchedAt);
      const fallbackDate = Number.isNaN(parsedSearchDate.getTime())
        ? new Date().toLocaleDateString(dateLocale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : parsedSearchDate.toLocaleDateString(dateLocale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

      setArticleData({
        title: entry.title ?? `${dict.article.titlePrefix} ${entry.topic}`,
        date: entry.generatedDate ?? fallbackDate,
        readingTime:
          entry.readingTime ??
          `${Math.max(1, Math.ceil(wordCount / 200))} ${dict.article.minRead}`,
        paragraphs: paragraphs.length > 0 ? paragraphs : [essayText],
      });
      setSection("article");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [dateLocale, dict.article.minRead, dict.article.titlePrefix, handleGenerate]
  );

  const handleNewTopic = () => {
    setSection("input");
    setTopic("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const toggleFontSize = () => {
    const next = (fontSizeIndex + 1) % 3;
    setFontSizeIndex(next);
    document.body.classList.remove(...fontSizeClasses);
    document.body.classList.add(fontSizeClasses[next]);
  };

  const handlePrint = () => window.print();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGenerate();
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

  if (section === "article" && articleData) {
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
              <span className="font-size-indicator">A</span>
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
            </button>
          </div>
        </div>

        <article className="blog-post paper-card">
          <header className="post-header">
            <div className="post-meta">
              <span className="reading-time">{articleData.readingTime}</span>
              <span className="separator">•</span>
              <span className="post-date">{articleData.date}</span>
            </div>
            <h1 className="post-title">{articleData.title}</h1>
            <div className="title-decoration" />
          </header>

          <div className="post-content">
            {articleData.paragraphs.map((p, i) => (
              <p key={i}>{p.trim()}</p>
            ))}
          </div>

          <footer className="post-footer">
            <div className="footer-decoration" />
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
            <span className="btn-icon">✨</span>
          </button>
        </div>

        <div className="level-controls">
          <label className="level-control" htmlFor="explanation-level">
            <span className="level-label">{dict.input.levelLabel}</span>
            <select
              id="explanation-level"
              className="level-select"
              value={explanationLevel}
              onChange={(e) => setExplanationLevel(e.target.value as Level)}
            >
              {levelOptions.map((option) => (
                <option key={`level-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="recent-searches">
          <div className="recent-searches-header">
            <h3 className="recent-searches-title">{dict.recent.heading}</h3>
          </div>

          {recentSearches.length === 0 ? (
            <p className="recent-searches-empty">{dict.recent.empty}</p>
          ) : (
            <ul className="recent-searches-list">
              {recentSearches.map((entry, index) => (
                <li
                  key={`${entry.topic}-${entry.searchedAt}`}
                  className="recent-searches-item"
                >
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
