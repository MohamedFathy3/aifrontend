"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Clock3, Mail, Plus, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { WorkspaceFrame } from "@/app/components/WorkspaceFrame";

type Client = { id: number; company_name: string };
type CalendarEvent = { id: string; summary?: string; description?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string }; attendees?: { email: string }[] };

type ClientsResponse = { data: Client[] };
type CalendarResponse = { items?: CalendarEvent[] };

function localDateTime(value: string | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [attendees, setAttendees] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState("");

  const clients = useQuery<ClientsResponse>({ queryKey: ["calendar-clients"], queryFn: async () => (await apiClient.get("/v1/clients", { params: { per_page: 100 } })).data });
  const calendar = useQuery<CalendarResponse>({ queryKey: ["calendar-events"], queryFn: async () => (await apiClient.get("/v1/google/calendar", { params: { limit: 50 } })).data });
  const createEvent = useMutation({
    mutationFn: async () => apiClient.post("/v1/google/calendar", {
      client_id: clientId ? Number(clientId) : null,
      title,
      description: description || null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      attendees: attendees.split(",").map(email => email.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      setTitle(""); setClientId(""); setStartsAt(""); setEndsAt(""); setAttendees(""); setDescription("");
      setNotice("Appointment created and invitations sent.");
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
    onError: () => setNotice("Could not create the appointment. Make sure Google Calendar is connected."),
  });

  function submit(event: FormEvent) { event.preventDefault(); createEvent.mutate(); }
  const events = useMemo(() => (calendar.data?.items || []).filter(item => item.start?.dateTime || item.start?.date), [calendar.data]);

  return <WorkspaceFrame title="Calendar" eyebrow="Appointments and client follow-up"><main className="standalone-page"><div className="content">
    <div className="page-intro"><div><p className="eyebrow">Sales calendar</p><h2>Plan the next conversation</h2><p>Create meetings for clients, invite their email, and keep every appointment in your Google Calendar.</p></div><div className="top-actions"><span className="panel-count">{events.length} upcoming events</span></div></div>
    {notice && <div className="notice"><CalendarDays size={16} /> {notice}</div>}
    <div className="two-col">
      <section className="panel"><div className="panel-head"><div><p className="eyebrow">New appointment</p><h3>Schedule a meeting</h3></div><Plus size={20} /></div>
        <form className="mail-compose" onSubmit={submit}>
          <label>Appointment title<input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Client review call" /></label>
          <label>Client<select value={clientId} onChange={e => setClientId(e.target.value)}><option value="">Personal / no client</option>{clients.data?.data?.map(client => <option value={client.id} key={client.id}>{client.company_name}</option>)}</select></label>
          <div className="form-grid"><label>Starts at<input required type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} /></label><label>Ends at<input required type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} /></label></div>
          <label><span><Mail size={14} /> Invite emails</span><input value={attendees} onChange={e => setAttendees(e.target.value)} placeholder="client@example.com, colleague@example.com" /><small>Separate multiple addresses with commas. Google will send the invitations.</small></label>
          <label>Notes<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Agenda, follow-up points, or meeting link…" rows={5} /></label>
          <button className="primary-button" disabled={createEvent.isPending}>{createEvent.isPending ? "Creating…" : "Create appointment"}</button>
        </form>
      </section>
      <section className="panel"><div className="panel-head"><div><p className="eyebrow">Your schedule</p><h3>Upcoming appointments</h3></div><Clock3 size={20} /></div>
        {calendar.isLoading ? <div className="empty">Loading your calendar…</div> : !events.length ? <div className="empty"><CalendarDays size={28} /><span>No upcoming appointments yet.</span></div> : <div className="follow-list">{events.map(item => <article className="follow-item" key={item.id}><div className="date-box"><strong>{new Date(item.start?.dateTime || item.start?.date || "").getDate()}</strong><span>{new Date(item.start?.dateTime || item.start?.date || "").toLocaleString("en", { month: "short" })}</span></div><div><strong>{item.summary || "Untitled appointment"}</strong><p>{localDateTime(item.start?.dateTime || item.start?.date)}{item.attendees?.length ? ` · ${item.attendees.length} invitee(s)` : ""}</p>{item.description && <small>{item.description}</small>}</div></article>)}</div>}
      </section>
    </div>
    <section className="panel calendar-help"><Users size={18} /><div><strong>Client follow-up made simple</strong><p>Select a client to keep the appointment linked to your CRM. The event is stored locally with its Google event ID, while Google Calendar remains the source of truth for your schedule.</p></div></section>
  </div></main></WorkspaceFrame>;
}

void CalendarPage;
