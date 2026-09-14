"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Mail, RefreshCw, Send, Sparkles, Unplug, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { WorkspaceFrame } from "@/app/components/WorkspaceFrame";

type MailItem = { id: string; thread_id?: string; subject: string; from?: string; to?: string; snippet?: string; date?: string; is_unread?: boolean };
type MailDetail = MailItem & { body?: string; cc?: string };
type InboxResponse = { messages: MailItem[]; next_page_token?: string | null; result_size_estimate?: number };

function address(value = "") { const match = value.match(/<([^>]+)>/); return match?.[1] || value.trim(); }
function displayName(value = "") { return value.replace(/<[^>]+>/, "").replace(/[\"]+/g, "").trim() || address(value); }

export default function InboxPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("newer_than:30d");
  const [composer, setComposer] = useState(false);
  const [body, setBody] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [notice, setNotice] = useState("");
  const [pages, setPages] = useState<InboxResponse[]>([]);
  const status = useQuery({ queryKey: ["google-status"], queryFn: async () => (await apiClient.get("/v1/google/status")).data });
  const connected = !!status.data?.connected;
  const inbox = useQuery<InboxResponse>({ queryKey: ["gmail", search], queryFn: async () => (await apiClient.get("/v1/google/gmail", { params: { q: search, limit: 30 } })).data, enabled: connected });
  const selected = useQuery<MailDetail>({ queryKey: ["gmail-message", selectedId], queryFn: async () => (await apiClient.get(`/v1/google/gmail/${selectedId}`)).data, enabled: !!selectedId && connected });
  const draft = useMutation({ mutationFn: async () => (await apiClient.post("/v1/ai/email-draft", { email: `From: ${selected.data?.from}\nSubject: ${selected.data?.subject}\n\n${selected.data?.body || selected.data?.snippet || ""}`, tone: "professional", goal: "reply helpfully and move the conversation forward" })).data, onSuccess: data => { setBody(data.draft || ""); setNotice("AI draft created. Review it before sending."); } });
  const send = useMutation({ mutationFn: async () => apiClient.post("/v1/google/gmail/send", { to: address(to), subject, body }), onSuccess: () => { setNotice("Email sent successfully."); setComposer(false); setBody(""); } });
  const messages = useMemo(() => pages.flatMap(page => page.messages), [pages]);
  const nextPageToken = pages.at(-1)?.next_page_token;
  useEffect(() => { if (inbox.data && pages.length === 0) setPages([inbox.data]); }, [inbox.data, pages.length]);

  async function loadFirstPage() { const result = await inbox.refetch(); if (result.data) setPages([result.data]); }
  async function loadMore() { if (!nextPageToken) return; const result = await apiClient.get<InboxResponse>("/v1/google/gmail", { params: { q: search, limit: 30, pageToken: nextPageToken } }); setPages(current => [...current, result.data]); }
  function openMessage(id: string) { setSelectedId(id); setComposer(false); setNotice(""); }
  function connect() { window.location.href = "/api/v1/google/connect"; }
  function submit(e: FormEvent) { e.preventDefault(); send.mutate(); }
  function startReply() { setComposer(true); setTo(address(selected.data?.from)); setSubject(selected.data?.subject?.toLowerCase().startsWith("re:") ? selected.data.subject : `Re: ${selected.data?.subject || ""}`); setBody(""); }

  return <WorkspaceFrame title="Gmail Inbox" eyebrow="Your connected mailbox"><main className="standalone-page"><div className="content">
    {!connected ? <section className="panel empty-loading"><Mail size={30} /><div><h2>Connect your Gmail account</h2><p>Each user connects their own Gmail account through Google OAuth. Your password is never stored in this system.</p><button className="primary-button" onClick={connect}><Link2 size={16} /> Connect Gmail</button></div></section> : <>
      <div className="page-intro"><div><p className="eyebrow">{status.data.email || "Connected Gmail"}</p><h2>Inbox</h2><p>Read, review and send messages without leaving the sales workspace.</p></div><div className="top-actions"><button className="secondary-button" onClick={loadFirstPage}><RefreshCw size={16} /> Refresh</button><button className="secondary-button" onClick={async () => { await apiClient.delete("/v1/google/disconnect"); queryClient.invalidateQueries({ queryKey: ["google-status"] }); }}><Unplug size={16} /> Disconnect</button></div></div>
      {notice && <div className="notice"><Sparkles size={16} /> {notice}<button onClick={() => setNotice("")}><X size={15} /></button></div>}
      <section className="panel inbox-panel"><div className="mail-toolbar"><input value={search} onChange={e => { setSearch(e.target.value); setPages([]); }} onKeyDown={e => { if (e.key === "Enter") loadFirstPage(); }} placeholder="Gmail search, e.g. is:unread" /><button className="primary-button" onClick={() => { setSelectedId(null); setComposer(true); setBody(""); setTo(""); setSubject(""); }}><Mail size={16} /> New email</button></div><div className="inbox-layout"><div className="mail-list"><div className="mail-list-header"><span>{messages.length} loaded</span><span>{inbox.data?.result_size_estimate ? `${inbox.data.result_size_estimate} total estimate` : ""}</span></div>{inbox.isLoading && !messages.length ? <div className="empty">Loading messages…</div> : !messages.length ? <div className="empty">No messages found.</div> : messages.map(message => <button className={selectedId === message.id ? "mail-row selected" : `mail-row${message.is_unread ? " unread" : ""}`} key={message.id} onClick={() => openMessage(message.id)}><span className="mail-sender">{displayName(message.from)}</span><span className="mail-subject">{message.subject}</span><span className="mail-snippet">{message.snippet}</span><time>{message.date ? new Date(message.date).toLocaleDateString() : ""}</time></button>)}<div className="mail-pagination">{nextPageToken ? <button className="secondary-button" onClick={loadMore}>Load more emails</button> : messages.length ? <span>No more emails</span> : null}</div></div><div className="mail-detail">{composer ? <form onSubmit={submit} className="mail-compose"><div className="panel-head"><div><p className="eyebrow">New message</p><h3>Compose email</h3></div></div><label>To<input required type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="client@example.com" /></label><label>Subject<input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" /></label><label>Message<textarea required value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message or generate an AI draft…" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => draft.mutate()} disabled={draft.isPending || !selected.data}>{draft.isPending ? "Generating…" : "Generate AI draft"}</button><button className="primary-button" disabled={send.isPending || !body}>{send.isPending ? "Sending…" : <><Send size={15} /> Send</>}</button></div></form> : selected.data ? <><div className="panel-head"><div><p className="eyebrow">{selected.data.from}</p><h3>{selected.data.subject}</h3><small>{selected.data.date ? new Date(selected.data.date).toLocaleString() : ""}</small></div><button className="primary-button" onClick={startReply}>Reply</button></div><article className="mail-body">{selected.data.body || selected.data.snippet}</article><div className="ai-action"><Sparkles size={18} /><div><strong>AI reply assistant</strong><p>Generate a draft, review it, edit anything needed, then send it yourself.</p></div><button className="secondary-button" onClick={() => { startReply(); draft.mutate(); }} disabled={draft.isPending}>{draft.isPending ? "Generating…" : "Generate draft"}</button></div></> : <div className="empty"><Mail size={28} /><span>Select a message to read it.</span></div>}</div></div></section>
    </>}
  </div></main></WorkspaceFrame>;
}
