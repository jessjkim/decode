"use client";

import { useState } from "react";

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

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<PfsRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCode = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`/api/cpt?code=${encodeURIComponent(trimmed)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Unable to fetch CPT data.");
      }
      const data = await response.json();
      setResult(data.record);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
              placeholder="Enter a CPT code (ex: 28238)"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="button" onClick={() => fetchCode(query)}>
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
                  fetchCode(code);
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
          <p>{result ? "1 match" : "No results yet"}</p>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {result ? (
          <div className="results__grid">
            <article className="card">
              <div className="card__header">
                <span className="code">{result.code}</span>
                <span className="tag">CMS PFS</span>
              </div>
              <h3>{result.description ?? "No description available"}</h3>
              <div className="detail">
                <span className="label">Status code</span>
                <span>{result.statusCode ?? "—"}</span>
              </div>
              <div className="detail">
                <span className="label">Global days</span>
                <span>{result.globalDays ?? "—"}</span>
              </div>
              <div className="detail">
                <span className="label">RVUs</span>
                <div className="rvu-grid">
                  <div>
                    <span className="rvu-label">Work</span>
                    <span>{result.workRvu ?? "—"}</span>
                  </div>
                  <div>
                    <span className="rvu-label">PE (non-fac)</span>
                    <span>{result.nonFacilityPeRvu ?? "—"}</span>
                  </div>
                  <div>
                    <span className="rvu-label">PE (fac)</span>
                    <span>{result.facilityPeRvu ?? "—"}</span>
                  </div>
                  <div>
                    <span className="rvu-label">MP</span>
                    <span>{result.malpracticeRvu ?? "—"}</span>
                  </div>
                  <div>
                    <span className="rvu-label">Total (non-fac)</span>
                    <span>{result.totalNonFacilityRvu ?? "—"}</span>
                  </div>
                  <div>
                    <span className="rvu-label">Total (fac)</span>
                    <span>{result.totalFacilityRvu ?? "—"}</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        ) : (
          <p className="empty">Enter a CPT code to see CMS data.</p>
        )}
      </section>
    </main>
  );
}
