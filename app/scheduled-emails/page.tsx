"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Mail, Sparkles, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { WorkspaceFrame } from "@/app/components/WorkspaceFrame";

type ScheduledEmail = { id: number; to_email: string; subject: string; body: string; scheduled_at: string; timezone: string; status: string };

export default function ScheduledEmailsPage() {
  const queryClient = useQueryClient();
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState("professional");
  const [notice, setNotice] = useState("");
  useEffect(() => { const params = new URLSearchParams(window.location.search); if (params.get("to")) setToEmail(params.get("to") || ""); if (params.get("subject")) setSubject(params.get("subject") || ""); }, []);
  const timezone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : "UTC";
  const emails = useQuery<{ data: ScheduledEmail[] }>({ queryKey: ["scheduled-emails"], queryFn: async () => (await apiClient.get("/v1/scheduled-emails")).data });
  const draft = useMutation({ mutationFn: async () => (await apiClient.post("/v1/ai/email-draft", { email: `Recipient: ${toEmail}\nSubject: ${subject}\nGoal: ${goal || "Write a helpful sales email"}\nPlease draft the complete email body.`, tone, goal: goal || "Write a helpful sales email" })).data, onSuccess: (data) => { setBody(data.draft || ""); setNotice("AI draft ready. Review it before scheduling."); }, onError: () => setNotice("AI assistant is unavailable. Check AI_API_KEY on the server.") });
  const create = useMutation({ mutationFn: () => apiClient.post("/v1/scheduled-emails", { to_email: toEmail, subject, body, scheduled_at: scheduledAt, timezone }), onSuccess: () => { setNotice("Email scheduled successfully."); setToEmail(""); setSubject(""); setBody(""); setScheduledAt(""); setGoal(""); queryClient.invalidateQueries({ queryKey: ["scheduled-emails"] }); }, onError: (error: any) => setNotice(error?.response?.data?.message || "Could not schedule email.") });
  const cancel = useMutation({ mutationFn: (id: number) => apiClient.delete(`/v1/scheduled-emails/${id}`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["scheduled-emails"] }) });
  const scheduled = emails.data?.data ?? [];
  function submit(event: FormEvent) { event.preventDefault(); create.mutate(); }
  return <WorkspaceFrame title="Scheduled emails" eyebrow="Gmail automation"><main className="standalone-page"><div className="content"><div className="page-intro"><div><p className="eyebrow">Write once, send later</p><h2>Schedule an email to a client</h2><p>Write the message, choose the exact time, and Gmail will send it automatically.</p></div><CalendarClock size={28} /></div>{notice && <div className="notice">{notice}</div>}<section className="panel"><div className="panel-head"><div><p className="eyebrow">New scheduled email</p><h3>Compose your message</h3></div><Mail size={20} /></div><form className="mail-compose" onSubmit={submit}><label>Client email<input required type="email" value={toEmail} onChange={e => setToEmail(e.target.value)} placeholder="client@example.com" /></label><label>Subject<input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Following up on our conversation" /></label><div className="form-grid"><label>Send date and time<input required type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} /><small>Timezone: {timezone}</small></label><label>Tone<select value={tone} onChange={e => setTone(e.target.value)}><option value="professional">Professional</option><option value="friendly">Friendly</option><option value="concise">Concise</option><option value="persuasive">Persuasive</option></select></label></div><label>What should the email achieve? <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Example: confirm the meeting and ask for the quotation" /></label><div className="flex flex-wrap gap-2"><button type="button" className="secondary-button" disabled={draft.isPending || !toEmail || !subject} onClick={() => draft.mutate()}><Sparkles size={15} /> {draft.isPending ? "Writing…" : "Help me write with AI"}</button></div><label>Email body<textarea required value={body} onChange={e => setBody(e.target.value)} placeholder="Write your email here, or let AI draft it…" rows={10} /></label><button className="primary-button" disabled={create.isPending}>{create.isPending ? "Scheduling…" : "Schedule email"}</button></form></section><section className="panel"><div className="panel-head"><div><p className="eyebrow">Your queue</p><h3>Scheduled and sent emails</h3></div></div>{!scheduled.length ? <div className="empty"><Mail size={22} /><span>No scheduled emails yet.</span></div> : <div className="table-wrap"><table><thead><tr><th>Recipient</th><th>Subject</th><th>Send time</th><th>Status</th><th /></tr></thead><tbody>{scheduled.map(email => <tr key={email.id}><td>{email.to_email}</td><td>{email.subject}</td><td>{new Date(email.scheduled_at).toLocaleString()}</td><td><span className={`badge ${email.status}`}>{email.status}</span></td><td>{email.status === "pending" && <button className="text-button text-red-600" onClick={() => cancel.mutate(email.id)}><Trash2 size={14} /> Cancel</button>}</td></tr>)}</tbody></table></div>}</section></div></main></WorkspaceFrame>;
}
