"use client";

import { useMemo, useState } from "react";

const CPT_DATA = [
  {
    code: "28238",
    title: "Partial excision of foot bone",
    summary: "Surgical removal of part of a foot bone, often to relieve pain or correct deformity.",
    typicalSetting: "Outpatient surgery center or hospital outpatient.",
    questions: [
      "Is imaging required before deciding on this procedure?",
      "What are the conservative alternatives?"
    ],
    similar: ["28230", "28232"]
  },
  {
    code: "27687",
    title: "Repair of leg tendon",
    summary: "Repair of a tendon in the lower leg or ankle region.",
    typicalSetting: "Outpatient surgery with regional or general anesthesia.",
    questions: [
      "Is this repair primary or a revision?",
      "What is the expected recovery timeline?"
    ],
    similar: ["27680", "27695"]
  },
  {
    code: "28300",
    title: "Osteotomy, midfoot",
    summary: "A controlled cut in a midfoot bone to realign or correct structure.",
    typicalSetting: "Outpatient surgery, often with post-op immobilization.",
    questions: [
      "Will hardware be placed and removed later?",
      "How long will non-weight-bearing last?"
    ],
    similar: ["28306", "28307"]
  },
  {
    code: "27658",
    title: "Fascia release, leg",
    summary: "Release of tight fascia in the lower leg to reduce pain or pressure.",
    typicalSetting: "Outpatient surgery with short recovery visit.",
    questions: [
      "Is this for chronic pain or acute compartment symptoms?",
      "What are the risks of recurrence?"
    ],
    similar: ["27654", "27652"]
  },
  {
    code: "28304",
    title: "Osteotomy, toe",
    summary: "Realignment of a toe bone using a precise bone cut.",
    typicalSetting: "Outpatient surgery, typically a short procedure.",
    questions: [
      "Will pins or screws be used?",
      "When can normal footwear resume?"
    ],
    similar: ["28306", "28309"]
  }
];

export default function Home() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return CPT_DATA;
    const normalized = trimmed.toLowerCase();
    return CPT_DATA.filter((item) => {
      return (
        item.code.includes(normalized) ||
        item.title.toLowerCase().includes(normalized) ||
        item.summary.toLowerCase().includes(normalized)
      );
    });
  }, [query]);

  return (
    <main className="page">
      <section className="hero">
        <div className="hero__content">
          <p className="eyebrow">CPT Clarity</p>
          <h1>Decode medical procedure codes in plain language.</h1>
          <p className="subhead">
            Start with a code. Get a clear explanation, common use cases, and
            smart questions to ask your provider.
          </p>
          <div className="search">
            <input
              aria-label="Search CPT code"
              placeholder="Enter a CPT code (ex: 28238)"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="button">Explain</button>
          </div>
          <div className="chip-row">
            {["28238", "27687", "28300", "27658", "28304"].map((code) => (
              <button
                key={code}
                className="chip"
                type="button"
                onClick={() => setQuery(code)}
              >
                {code}
              </button>
            ))}
          </div>
          <p className="disclaimer">
            Demo dataset for preview only. Connect real data sources to replace
            these examples.
          </p>
        </div>
        <div className="hero__panel">
          <div className="panel-card">
            <p className="panel-title">How it works</p>
            <ol>
              <li>Paste a code or upload a bill.</li>
              <li>We match it to trusted sources.</li>
              <li>Get a clear, consumer-friendly summary.</li>
            </ol>
          </div>
          <div className="panel-card highlight">
            <p className="panel-title">AI agent tasks</p>
            <p>
              Extract codes, retrieve policy context, summarize, and suggest
              questions to ask.
            </p>
          </div>
        </div>
      </section>

      <section className="results">
        <div className="results__header">
          <h2>Code results</h2>
          <p>{results.length} matches</p>
        </div>
        <div className="results__grid">
          {results.map((item) => (
            <article key={item.code} className="card">
              <div className="card__header">
                <span className="code">{item.code}</span>
                <span className="tag">Common</span>
              </div>
              <h3>{item.title}</h3>
              <p className="summary">{item.summary}</p>
              <div className="detail">
                <span className="label">Typical setting</span>
                <span>{item.typicalSetting}</span>
              </div>
              <div className="detail">
                <span className="label">Questions to ask</span>
                <ul>
                  {item.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>
              <div className="detail">
                <span className="label">Similar codes</span>
                <div className="similar">
                  {item.similar.map((code) => (
                    <span key={code}>{code}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
