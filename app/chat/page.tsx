"use client";
import { FormEvent, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { WorkspaceFrame } from "@/app/components/WorkspaceFrame";

export default function ChatPage() {
  const [message, setMessage] = useState(""); const [answer, setAnswer] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); try { const r = await apiClient.post("/v1/ai/chat", { message }); setAnswer(r.data.answer || r.data.message); } catch (e: any) { setAnswer(e?.response?.data?.message || "AI is not configured."); } finally { setBusy(false); } }
  return <WorkspaceFrame title="CRM Chat Assistant" eyebrow="Your private workspace assistant"><main className="standalone-page"><div className="content"><div className="page-intro"><p className="eyebrow">Your private workspace assistant</p><h1>CRM Chat Assistant</h1><p>Ask about your leads, clients and follow-ups. Results are scoped to your Sales account.</p></div><section className="panel chat-panel"><div className="ai-reply">{answer || "Ask me who needs follow-up, which leads are qualified, or how to prioritize your pipeline."}</div><form onSubmit={submit}><label>Your question<textarea value={message} onChange={e => setMessage(e.target.value)} required minLength={2} placeholder="مثال: ما هي الشركات المؤهلة التي لم أتواصل معها؟" /></label><button className="primary-button" disabled={busy}>{busy ? "Thinking…" : "Ask assistant"}</button></form></section></div></main></WorkspaceFrame>;
}
