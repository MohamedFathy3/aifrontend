"use client";
import { FormEvent, useState } from "react";
import { Mail, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { WorkspaceFrame } from "@/app/components/WorkspaceFrame";
export default function SendEmailPage() {
  const [to, setTo] = useState(""); const [subject, setSubject] = useState(""); const [body, setBody] = useState(""); const [notice, setNotice] = useState("");
  const send = useMutation({ mutationFn: () => apiClient.post("/v1/google/gmail/send", { to, subject, body }), onSuccess: () => { setNotice("Email sent successfully."); setTo(""); setSubject(""); setBody(""); }, onError: () => setNotice("Email could not be sent. Connect Gmail first.") });
  function submit(event: FormEvent) { event.preventDefault(); send.mutate(); }
  return <WorkspaceFrame title="Send email" eyebrow="Gmail"><main className="standalone-page"><div className="content"><div className="page-intro"><div><p className="eyebrow">Outgoing mail</p><h2>Send a new email</h2><p>Inbox and outgoing email are separate pages.</p></div><Mail size={25} /></div>{notice && <div className="notice">{notice}</div>}<section className="panel"><div className="panel-head"><div><p className="eyebrow">Compose</p><h3>New message</h3></div><Send size={20} /></div><form className="mail-compose" onSubmit={submit}><label>To<input required type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="client@example.com" /></label><label>Subject<input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" /></label><label>Message<textarea required value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message…" rows={12} /></label><button className="primary-button" disabled={send.isPending}>{send.isPending ? "Sending…" : "Send email"}</button></form></section></div></main></WorkspaceFrame>;
}
