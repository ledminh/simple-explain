import { getDictionary, type Lang } from "@/lib/dictionaries";
import Link from "next/link";
import SimpleExplainClient from "./SimpleExplainClient";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = getDictionary(lang as Lang);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <h1 className="logo">{dict.header.logo}</h1>
            <p className="tagline">{dict.header.tagline}</p>
          </div>
          <div className="lang-switcher">
            <Link
              href="/en"
              className={`lang-btn ${lang === "en" ? "active" : ""}`}
            >
              EN
            </Link>
            <Link
              href="/vi"
              className={`lang-btn ${lang === "vi" ? "active" : ""}`}
            >
              VI
            </Link>
          </div>
        </div>
      </header>

      <main className="container">
        <SimpleExplainClient
          lang={lang}
          dict={{
            input: dict.input,
            recent: dict.recent,
            loading: dict.loading,
            lesson: dict.lesson,
            article: dict.article,
            errorMessage: dict.errorMessage,
          }}
        />
      </main>
    </>
  );
}
