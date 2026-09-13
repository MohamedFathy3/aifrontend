"use client";
import { FormEvent, useState } from "react";
import { MessageCircle, Search, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export function AiSalesDesk() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  async function ask(event: FormEvent) { event.preventDefault(); if (!message.trim()) return; setBusy(true); try { const response = await apiClient.post("/v1/ai/chat", { message }); setReply(response.data.answer || response.data.message); } catch (error: any) { setReply(error?.response?.data?.message || "AI is not configured yet."); } finally { setBusy(false); } }
  async function research(event: FormEvent) { event.preventDefault(); if (!query.trim()) return; setBusy(true); try { const response = await apiClient.post("/v1/ai/lead-search", { query }); setResults(response.data.results || []); } catch (error: any) { setReply(error?.response?.data?.message || "Search provider is not configured yet."); } finally { setBusy(false); } }
  return <section className="panel ai-desk"><div className="panel-head"><div><p className="eyebrow">AI sales desk</p><h3>Find companies and understand your workspace</h3></div><button className="secondary-button" type="button" onClick={() => { window.location.href = "/api/v1/google/connect"; }}>Connect my Gmail + Calendar</button><Sparkles size={20} /></div><div className="ai-grid"><form onSubmit={research}><label>Research new prospects<input value={query} onChange={e => setQuery(e.target.value)} placeholder="مثال: شركات تستورد مواد غذائية في جدة" /></label><button className="primary-button" disabled={busy}><Search size={16} /> Search prospects</button></form><form onSubmit={ask}><label>Ask about your CRM<input value={message} onChange={e => setMessage(e.target.value)} placeholder="مثال: من العملاء الذين لم أتابعهم؟" /></label><button className="secondary-button" disabled={busy}><MessageCircle size={16} /> Ask assistant</button></form></div>{reply && <div className="ai-reply">{reply}</div>}{results.length > 0 && <div className="ai-results">{results.map(item => <article key={item.id}><strong>{item.company_name}</strong><p>{item.description}</p>{item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer">View source</a>}</article>)}</div>}</section>;
}
