"use client";

import { FormEvent, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { WorkspaceFrame } from "@/app/components/WorkspaceFrame";
import { MarkdownView } from "@/app/components/MarkdownView";

type Tone = "professional" | "friendly" | "concise" | "persuasive";

const TONES: { value: Tone; label: string; hint: string }[] = [
  { value: "professional", label: "Professional", hint: "Formal and polished" },
  { value: "friendly",     label: "Friendly",     hint: "Warm and approachable" },
  { value: "concise",      label: "Concise",      hint: "Short and to the point" },
  { value: "persuasive",   label: "Persuasive",   hint: "Confident and compelling" },
];

const GOAL_PRESETS = [
  "advance the conversation",
  "book a discovery call",
  "handle an objection",
  "follow up after no reply",
  "close the deal",
];

export default function EmailCoachPage() {
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("advance the conversation");
  const [tone, setTone] = useState<Tone>("professional");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const wordCount = useMemo(
    () => email.trim().split(/\s+/).filter(Boolean).length,
    [email]
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    setAnswer("");
    setCopied(false);

    try {
      const r = await apiClient.post("/v1/ai/email-coach", { email, goal, tone });
      setAnswer(r.data.analysis || r.data.message || "");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "AI is not configured. Please try again later."
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyAnswer() {
    if (!answer) return;
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  function reset() {
    setEmail("");
    setGoal("advance the conversation");
    setTone("professional");
    setAnswer("");
    setError(null);
  }

  return (
    <WorkspaceFrame
      title="Email Coach"
      eyebrow="Sales communication intelligence"
    >
      <main className="standalone-page email-coach">
        <div className="content">
          {/* ── Page intro ───────────────────────────────── */}
          <div className="page-intro">
            <p className="eyebrow">Sales communication intelligence</p>
            <h1>Analyze an email and write the best reply</h1>
            <p>
              Understand the sender&apos;s intent, strengths, objections and the
              next response before you send.
            </p>
          </div>

          <div className="email-coach-grid">
            {/* ── Left: input form ─────────────────────── */}
            <section className="panel email-coach-form">
              <header className="panel-header">
                <h3>Compose your request</h3>
                <span className="badge">
                  {wordCount} word{wordCount === 1 ? "" : "s"}
                </span>
              </header>

              <form onSubmit={submit}>
                <label className="field">
                  <span className="field-label">Paste the email</span>
                  <textarea
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    minLength={10}
                    rows={10}
                    placeholder="Paste the full email conversation here..."
                    aria-label="Email content"
                  />
                  <span className="field-hint">
                    Include the full thread for the most accurate analysis.
                  </span>
                </label>

                <div className="ai-grid">
                  <label className="field">
                    <span className="field-label">Goal</span>
                    <input
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="advance the conversation"
                      aria-label="Goal"
                    />
                    <div className="chip-row">
                      {GOAL_PRESETS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          className={`chip ${goal === g ? "chip-active" : ""}`}
                          onClick={() => setGoal(g)}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </label>

                  <label className="field">
                    <span className="field-label">Tone</span>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value as Tone)}
                      aria-label="Tone"
                    >
                      {TONES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label} — {t.hint}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={busy || email.trim().length < 10}
                  >
                    {busy ? (
                      <>
                        <span className="spinner" aria-hidden="true" />
                        Analyzing…
                      </>
                    ) : (
                      "Analyze and draft reply"
                    )}
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={reset}
                    disabled={busy}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </section>

            {/* ── Right: result ────────────────────────── */}
            <section className="panel email-coach-result">
              <header className="panel-header">
                <h3>AI analysis</h3>
                {answer && (
                  <button
                    type="button"
                    className="ghost-button small"
                    onClick={copyAnswer}
                  >
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                )}
              </header>

              {busy && (
                <div className="result-placeholder">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                  <p>Analyzing intent, tone and objections…</p>
                </div>
              )}

              {!busy && error && (
                <div className="alert alert-error" role="alert">
                  {error}
                </div>
              )}

              {!busy && !error && answer && (
                <div className="result-body">
                  <MarkdownView>{answer}</MarkdownView>
                </div>
              )}

              {!busy && !error && !answer && (
                <div className="result-placeholder empty">
                  <div className="empty-icon" aria-hidden="true">✉️</div>
                  <h4>No analysis yet</h4>
                  <p>
                    Paste an email on the left and choose a goal and tone to
                    receive strengths, weaknesses, risks and a suggested reply.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* ── Scoped styles ─────────────────────────────── */}
      <style jsx>{`
        .email-coach .content {
          max-width: 1200px;
        }
        .email-coach-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 1.25rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .email-coach-grid {
            grid-template-columns: 1fr;
          }
        }
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .panel-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }
        .badge {
          font-size: 0.75rem;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          opacity: 0.85;
        }
        .field {
          display: block;
          margin-bottom: 1rem;
        }
        .field-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.35rem;
          opacity: 0.9;
        }
        .field-hint {
          display: block;
          font-size: 0.72rem;
          opacity: 0.55;
          margin-top: 0.3rem;
        }
        .field textarea,
        .field input,
        .field select {
          width: 100%;
          box-sizing: border-box;
        }
        .chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: 0.5rem;
        }
        .chip {
          font-size: 0.72rem;
          padding: 0.3rem 0.6rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: transparent;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .chip:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .chip-active {
          background: rgba(120, 170, 255, 0.18);
          border-color: rgba(120, 170, 255, 0.5);
        }
        .form-actions {
          display: flex;
          gap: 0.6rem;
          margin-top: 1rem;
        }
        .primary-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ghost-button {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 8px;
          padding: 0.55rem 0.9rem;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background 0.15s;
        }
        .ghost-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
        }
        .ghost-button.small {
          padding: 0.25rem 0.6rem;
          font-size: 0.75rem;
        }
        .ghost-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .result-body {
          font-size: 0.9rem;
        }
        .result-placeholder {
          padding: 1rem;
          border-radius: 10px;
          border: 1px dashed rgba(255, 255, 255, 0.12);
          text-align: center;
          opacity: 0.85;
        }
        .result-placeholder.empty {
          padding: 2.5rem 1.25rem;
        }
        .empty-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .result-placeholder h4 {
          margin: 0 0 0.35rem;
          font-size: 0.95rem;
        }
        .result-placeholder p {
          margin: 0;
          font-size: 0.8rem;
          opacity: 0.7;
          line-height: 1.5;
        }
        .skeleton-line {
          height: 10px;
          border-radius: 6px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.12),
            rgba(255, 255, 255, 0.05)
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          margin-bottom: 0.6rem;
        }
        .skeleton-line.short {
          width: 60%;
        }
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .alert {
          padding: 0.75rem 0.9rem;
          border-radius: 8px;
          font-size: 0.85rem;
        }
        .alert-error {
          background: rgba(255, 80, 80, 0.12);
          border: 1px solid rgba(255, 80, 80, 0.35);
        }
      `}</style>
    </WorkspaceFrame>
  );
}