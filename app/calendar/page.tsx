"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Mail, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { WorkspaceFrame } from "@/app/components/WorkspaceFrame";

type Client = { id: number; company_name: string };
type CalendarEvent = { id: string; summary?: string; description?: string; start?: { dateTime?: string; date?: string }; attendees?: { email: string }[] };
type FollowUp = { id: number; subject_type: string; subject_id: number; type: string; due_date: string; due_time?: string; note?: string };
type CalendarResponse = { items?: CalendarEvent[] };
type ClientsResponse = { data: Client[] };
type FollowUpsResponse = { data: FollowUp[] };

function localDateTime(value: string | undefined) { return value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : ""; }
function dayKey(value: string | undefined) { if (!value) return ""; const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function monthTitle(date: Date) { return date.toLocaleString("en", { month: "long", year: "numeric" }); }

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => dayKey(new Date().toISOString()));
  const [title, setTitle] = useState(""); const [clientId, setClientId] = useState(""); const [startsAt, setStartsAt] = useState(""); const [endsAt, setEndsAt] = useState(""); const [attendees, setAttendees] = useState(""); const [description, setDescription] = useState(""); const [notice, setNotice] = useState("");
  const clients = useQuery<ClientsResponse>({ queryKey: ["calendar-clients"], queryFn: async () => (await apiClient.get("/v1/clients", { params: { per_page: 100 } })).data });
  const calendar = useQuery<CalendarResponse>({ queryKey: ["calendar-events"], queryFn: async () => (await apiClient.get("/v1/google/calendar", { params: { limit: 100 } })).data });
  const followUps = useQuery<FollowUpsResponse>({ queryKey: ["calendar-follow-ups"], queryFn: async () => (await apiClient.get("/v1/follow-ups", { params: { per_page: 100 } })).data });
  const events = useMemo(() => (calendar.data?.items || []).filter(item => item.start?.dateTime || item.start?.date), [calendar.data]);
  const tasks = followUps.data?.data || [];
  const selectedEvents = events.filter(item => dayKey(item.start?.dateTime || item.start?.date) === selectedDay);
  const selectedTasks = tasks.filter(item => dayKey(item.due_date) === selectedDay);
  const cells = useMemo(() => { const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1); const start = new Date(first); start.setDate(1 - first.getDay()); return Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; }); }, [viewDate]);
  const createEvent = useMutation({ mutationFn: async () => apiClient.post("/v1/google/calendar", { client_id: clientId ? Number(clientId) : null, title, description: description || null, starts_at: new Date(startsAt).toISOString(), ends_at: new Date(endsAt).toISOString(), attendees: attendees.split(",").map(email => email.trim()).filter(Boolean) }), onSuccess: () => { setTitle(""); setClientId(""); setStartsAt(""); setEndsAt(""); setAttendees(""); setDescription(""); setNotice("Appointment created and invitations sent."); queryClient.invalidateQueries({ queryKey: ["calendar-events"] }); }, onError: () => setNotice("Could not create the appointment. Make sure Google Calendar is connected.") });
  function submit(event: FormEvent) { event.preventDefault(); createEvent.mutate(); }
  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const today = dayKey(new Date().toISOString());

  return <WorkspaceFrame title="Calendar" eyebrow="Appointments and client follow-up"><main className="standalone-page"><div className="content">
    <div className="page-intro"><div><p className="eyebrow">Sales calendar</p><h2>Plan the next conversation</h2><p>Choose a day to see its appointments and CRM tasks.</p></div><span className="panel-count">{events.length + tasks.length} scheduled items</span></div>
    {notice && <div className="notice"><CalendarDays size={16} /> {notice}</div>}
    <section className="panel month-calendar"><div className="panel-head"><div><p className="eyebrow">Monthly view</p><h3>{monthTitle(viewDate)}</h3></div><div className="calendar-nav"><button className="icon-button" onClick={prevMonth} aria-label="Previous month"><ChevronLeft size={18} /></button><button className="secondary-button" onClick={() => { setViewDate(new Date()); setSelectedDay(today); }}>Today</button><button className="icon-button" onClick={nextMonth} aria-label="Next month"><ChevronRight size={18} /></button></div></div>
      <div className="calendar-weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">{cells.map(date => { const key = dayKey(date.toISOString()); const inMonth = date.getMonth() === viewDate.getMonth(); const dayEvents = events.filter(item => dayKey(item.start?.dateTime || item.start?.date) === key); const dayTasks = tasks.filter(item => dayKey(item.due_date) === key); return <button type="button" className={`calendar-day ${!inMonth ? "muted" : ""} ${key === selectedDay ? "selected" : ""} ${key === today ? "today" : ""}`} key={key} onClick={() => setSelectedDay(key)}><strong>{date.getDate()}</strong>{dayEvents.length > 0 && <span className="calendar-dot event-dot">{dayEvents.length} meeting{dayEvents.length > 1 ? "s" : ""}</span>}{dayTasks.length > 0 && <span className="calendar-dot task-dot">{dayTasks.length} task{dayTasks.length > 1 ? "s" : ""}</span>}</button>; })}</div>
    </section>
    <section className="panel selected-agenda"><div className="panel-head"><div><p className="eyebrow">Selected day</p><h3>{new Date(`${selectedDay}T12:00:00`).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</h3></div><Clock3 size={20} /></div>{!selectedEvents.length && !selectedTasks.length ? <div className="empty"><CalendarDays size={24} /><span>No meetings or tasks for this day.</span></div> : <div className="agenda-list">{selectedEvents.map(item => <article className="agenda-item event-item" key={`event-${item.id}`}><span className="agenda-type">Meeting</span><div><strong>{item.summary || "Untitled appointment"}</strong><p>{localDateTime(item.start?.dateTime || item.start?.date)}{item.attendees?.length ? ` · ${item.attendees.length} invitee(s)` : ""}</p>{item.description && <small>{item.description}</small>}</div></article>)}{selectedTasks.map(task => <article className="agenda-item task-item" key={`task-${task.id}`}><span className="agenda-type">Task</span><div><strong>{task.type.replace("_", " ")} · {task.subject_type} #{task.subject_id}</strong><p>{task.due_time ? `${task.due_date} at ${task.due_time}` : task.due_date}</p>{task.note && <small>{task.note}</small>}</div></article>)}</div>}</section>
    <div className="two-col"><section className="panel"><div className="panel-head"><div><p className="eyebrow">New appointment</p><h3>Schedule a meeting</h3></div><Plus size={20} /></div><form className="mail-compose" onSubmit={submit}><label>Appointment title<input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Client review call" /></label><label>Client<select value={clientId} onChange={e => setClientId(e.target.value)}><option value="">Personal / no client</option>{clients.data?.data?.map(client => <option value={client.id} key={client.id}>{client.company_name}</option>)}</select></label><div className="form-grid"><label>Starts at<input required type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} /></label><label>Ends at<input required type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} /></label></div><label><span><Mail size={14} /> Invite emails</span><input value={attendees} onChange={e => setAttendees(e.target.value)} placeholder="client@example.com, colleague@example.com" /></label><label>Notes<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Agenda, follow-up points, or meeting link…" rows={5} /></label><button className="primary-button" disabled={createEvent.isPending}>{createEvent.isPending ? "Creating…" : "Create appointment"}</button></form></section></div>
  </div></main></WorkspaceFrame>;
}
void CalendarPage;
