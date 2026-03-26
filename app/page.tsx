"use client";

import { useMemo, useState } from "react";

const SAMPLE_CODES = ["28238", "27687", "28300", "27658", "28304"];

type PfsRecord = {
  code: string;
  description: string | null;
  statusCode: string | null;
  paymentIndicator: string | null;
  workRvu: number | null;
  nonFacilityPeRvu: number | null;
  facilityPeRvu: number | null;
  malpracticeRvu: number | null;
  totalNonFacilityRvu: number | null;
  totalFacilityRvu: number | null;
  pcTcIndicator: string | null;
  globalDays: string | null;
};

type AgentSummary = {
  summary: string;
  questions: string[];
  cached: boolean;
};

type CptResult = {
  record: PfsRecord;
  summary: string;
  questions: string[];
};

const explainGlobalDays = (days: string | null) => {
  if (!days) return "Not available in the CMS file.";
  if (days === "000") return "Minor procedure; follow-up care is generally bundled for the same day only.";
  if (days === "010") return "Minor procedure; follow-up care is generally bundled for 10 days.";
  if (days === "090") return "Major procedure; follow-up care is generally bundled for 90 days.";
  if (days === "MMM") return "Maternity code; global days don’t apply in the usual way.";
  if (days === "XXX") return "Global days don’t apply to this code.";
  if (days === "YYY") return "Determined by the payer for this code.";
  if (days === "ZZZ") return "Bundled into another primary service.";
  return "See payer rules for this global period.";
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CptResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const codesFromInput = useMemo(() => {
    const raw = query
      .split(/[\s,]+/)
      .map((value) => value.trim())
      .filter(Boolean);
    const unique = Array.from(new Set(raw));
    return unique.slice(0, 20);
  }, [query]);

  const fetchCodes = async (codes: string[]) => {
    if (!codes.length) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setExpanded(new Set());
    try {
      const responses = await Promise.all(
        codes.map(async (code) => {
          const [cptResponse, summaryResponse] = await Promise.all([
            fetch(`/api/cpt?code=${encodeURIComponent(code)}`),
            fetch("/api/agent/summary", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ code })
            })
          ]);

          if (!cptResponse.ok) {
            const data = await cptResponse.json();
            throw new Error(data.error ?? `Unable to fetch ${code}.`);
          }

          if (!summaryResponse.ok) {
            const data = await summaryResponse.json();
            throw new Error(data.error ?? `Unable to summarize ${code}.`);
          }

          const cptData = await cptResponse.json();
          const summaryData = (await summaryResponse.json()) as AgentSummary;

          return {
            record: cptData.record as PfsRecord,
            summary: summaryData.summary,
            questions: summaryData.questions
          };
        })
      );
      setResults(responses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

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
              placeholder="Enter one or more CPT codes (ex: 28238, 27687)"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              type="button"
              onClick={() => fetchCodes(codesFromInput)}
              disabled={!codesFromInput.length}
            >
              {loading ? "Loading..." : "Explain"}
            </button>
          </div>
          <div className="chip-row">
            {SAMPLE_CODES.map((code) => (
              <button
                key={code}
                className="chip"
                type="button"
                onClick={() => {
                  setQuery(code);
                  fetchCodes([code]);
                }}
              >
                {code}
              </button>
            ))}
          </div>
          <p className="disclaimer">
            Data source: CMS 2025 Physician Fee Schedule RVU file (October
            release).
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
        </div>
      </section>

      <section className="results">
        <div className="results__header">
          <h2>Code results</h2>
          <p>{results.length ? `${results.length} match${results.length > 1 ? "es" : ""}` : "No results yet"}</p>
        </div>
        {results.length ? (
          <div className="summary-bar">
            <p>
              You entered {results.length} code{results.length > 1 ? "s" : ""}.
              We show a short description and simple follow-up window for each.
            </p>
          </div>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
        {results.length ? (
          <div className="results__grid">
            {results.map((result) => (
              <article key={result.record.code} className="card">
                <div className="card__header">
                  <span className="code">{result.record.code}</span>
                  <span className="tag">CMS PFS</span>
                </div>
                <h3>{result.record.description ?? "No description available"}</h3>
                <div className="detail">
                  <span className="label">Description</span>
                  <div className="plain-list">
                    <p>{result.summary}</p>
                  </div>
                </div>
                <div className="detail">
                  <span className="label">Follow-up window</span>
                  <span>{result.record.globalDays ?? "—"} days</span>
                  <span className="helper">{explainGlobalDays(result.record.globalDays)}</span>
                </div>
                <div className="detail">
                  <span className="label">Questions to ask</span>
                  <ul>
                    {result.questions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  className="tech-toggle"
                  onClick={() => toggleExpanded(result.record.code)}
                >
                  {expanded.has(result.record.code)
                    ? "Hide technical details"
                    : "Show technical details"}
                </button>
                {expanded.has(result.record.code) ? (
                  <div className="detail tech-section">
                    <span className="label">Technical details (RVUs)</span>
                    <div className="rvu-grid">
                      <div>
                        <span className="rvu-label">Work</span>
                        <span>{result.record.workRvu ?? "—"}</span>
                      </div>
                      <div>
                        <span className="rvu-label">PE (non-fac)</span>
                        <span>{result.record.nonFacilityPeRvu ?? "—"}</span>
                      </div>
                      <div>
                        <span className="rvu-label">PE (fac)</span>
                        <span>{result.record.facilityPeRvu ?? "—"}</span>
                      </div>
                      <div>
                        <span className="rvu-label">MP</span>
                        <span>{result.record.malpracticeRvu ?? "—"}</span>
                      </div>
                      <div>
                        <span className="rvu-label">Total (non-fac)</span>
                        <span>{result.record.totalNonFacilityRvu ?? "—"}</span>
                      </div>
                      <div>
                        <span className="rvu-label">Total (fac)</span>
                        <span>{result.record.totalFacilityRvu ?? "—"}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="empty">Enter a CPT code to see CMS data.</p>
        )}
      </section>
    </main>
  );
}
