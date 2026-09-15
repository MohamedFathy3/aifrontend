"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, ClipboardList, Mail, Plus, Trash2, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { WorkspaceFrame } from "./WorkspaceFrame";
import { CountryCitySelect } from "./CountryCitySelect";
import { EditRecordModal } from "./EditRecordModal";

type CrmType = "leads" | "clients" | "shipments" | "follow-ups" | "agents";

const labels: Record<CrmType, { title: string; eyebrow: string; description: string }> = {
  leads: { title: "Leads", eyebrow: "Prospecting", description: "Track prospects and convert qualified opportunities into clients." },
  clients: { title: "Clients", eyebrow: "Relationship management", description: "Manage the companies already in your customer portfolio." },
  shipments: { title: "Shipments", eyebrow: "Operations", description: "Keep shipment references, routes, and customer activity in one place." },
  "follow-ups": { title: "Follow-ups", eyebrow: "Next actions", description: "Stay on top of calls, emails, meetings, and other customer actions." },
  agents: { title: "Agents", eyebrow: "Partner network", description: "Manage freight agents and their contact details." },
};

const statusLabels: Record<string, string> = { new: "New", contacted: "Contacted", interested: "Interested", follow_up: "Follow-up", qualified: "Qualified", converted: "Converted", lost: "Lost", not_interested: "Not interested" };
const openLeadStatuses = new Set(["new", "contacted", "interested", "follow_up", "qualified"]);

export function CrmRecordsPage({ type }: { type: CrmType }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError } = useCurrentUser();
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [form, setForm] = useState({ company_name: "", country: "", city: "", address: "", website: "", contact_person: "", email: "", phone: "", notes: "" });
  const page = labels[type];

  useEffect(() => { if (!isLoading && (isError || user === null)) router.replace("/login"); }, [isLoading, isError, user, router]);
  const records = useQuery<{ data: any[] }>({ queryKey: [type, search], queryFn: async () => (await apiClient.get(`/v1/${type}`, { params: { search: search || undefined } })).data, enabled: !!user });
  const convert = useMutation({ mutationFn: (id: number) => apiClient.post(`/v1/leads/${id}/convert`), onSuccess: () => { setNotice("Lead converted to client."); queryClient.invalidateQueries({ queryKey: [type] }); queryClient.invalidateQueries({ queryKey: ["clients"] }); } });
  const remove = useMutation({ mutationFn: (id: number) => apiClient.delete(`/v1/${type}/${id}`), onSuccess: () => { setNotice("Record deleted."); queryClient.invalidateQueries({ queryKey: [type] }); } });
  const bulkRemove = useMutation({ mutationFn: async () => Promise.all(selectedIds.map(id => apiClient.delete(`/v1/${type}/${id}`))), onSuccess: () => { setSelectedIds([]); setNotice("Selected records deleted."); queryClient.invalidateQueries({ queryKey: [type] }); } });
  const create = useMutation({ mutationFn: () => apiClient.post(`/v1/${type}`, type === "agents" ? form : { company_name: form.company_name, country: form.country, city: form.city, address: form.address, website: form.website, industry: form.contact_person, email: form.email, phone: form.phone, description: form.notes }), onSuccess: () => { setShowCreate(false); setForm({ company_name: "", country: "", city: "", address: "", website: "", contact_person: "", email: "", phone: "", notes: "" }); setNotice(`${page.title.slice(0, -1)} created successfully.`); queryClient.invalidateQueries({ queryKey: [type] }); } });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) => apiClient.patch(`/v1/${type}/${id}`, payload), onSuccess: () => { setEditRow(null); setNotice("Record updated successfully."); queryClient.invalidateQueries({ queryKey: [type] }); } });

  if (isLoading || !user) return <div className="loading">Loading your workspace…</div>;
  const rows = records.data?.data ?? [];
  return <WorkspaceFrame title={page.title} eyebrow={page.eyebrow}>
    {notice && <div className="mx-auto flex max-w-[1500px] items-center gap-2 px-5 pt-5 text-sm text-emerald-700 md:px-8"><CheckCircle2 size={16} /> {notice}<button className="ml-auto" onClick={() => setNotice("")}><X size={15} /></button></div>}
    <main className="content">
      <div className="page-intro"><div><p className="eyebrow">{page.eyebrow}</p><h2>{page.title}</h2><p>{page.description}</p></div><div className="top-actions"><span className="panel-count">{rows.length} shown</span>{(type === "clients" || type === "agents") && <button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={15} /> Add {type === "clients" ? "client" : "agent"}</button>}</div></div>
      <div className="mb-4 flex max-w-md items-center gap-2"><input className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${page.title.toLowerCase()}…`} /></div>
      <section className="panel"><div className="bulk-toolbar"><label><input type="checkbox" checked={rows.length > 0 && selectedIds.length === rows.length} onChange={() => setSelectedIds(selectedIds.length === rows.length ? [] : rows.map(row => row.id))} /> Select all</label>{selectedIds.length > 0 && <button className="danger-button" disabled={bulkRemove.isPending} onClick={() => { if (window.confirm(`Delete ${selectedIds.length} selected records?`)) bulkRemove.mutate(); }}><Trash2 size={14} /> Delete selected ({selectedIds.length})</button>}</div><RecordTable rows={rows} type={type} selectedIds={selectedIds} onToggle={(id) => setSelectedIds(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id])} onEdit={type === "clients" || type === "leads" || type === "shipments" || type === "agents" ? setEditRow : undefined} onConvert={(id) => convert.mutate(id)} onDelete={(id) => { if (window.confirm("Delete this record?")) remove.mutate(id); }} converting={convert.isPending || remove.isPending || bulkRemove.isPending || update.isPending} /></section>
    </main>
    {showCreate && <CreateRecordModal type={type as "clients" | "agents"} form={form} setForm={setForm} loading={create.isPending} onClose={() => setShowCreate(false)} onSubmit={() => create.mutate()} />}
    {editRow && <EditRecordModal type={type as "clients" | "leads" | "shipments" | "agents"} row={editRow} loading={update.isPending} onClose={() => setEditRow(null)} onSubmit={(payload) => update.mutate({ id: editRow.id, payload })} />}
  </WorkspaceFrame>;
}

function RecordTable({ rows, type, selectedIds, onToggle, onEdit, onConvert, onDelete, converting }: { rows: any[]; type: CrmType; selectedIds: number[]; onToggle: (id: number) => void; onEdit?: (row: any) => void; onConvert: (id: number) => void; onDelete: (id: number) => void; converting: boolean }) {
  if (!rows.length) return <div className="empty"><ClipboardList size={22} /><span>No records found yet.</span></div>;
  return <div className="table-wrap"><table><thead><tr><th>Name / reference</th><th>Location / detail</th><th>Status</th><th>Updated</th><th /></tr></thead><tbody>{rows.map(row => {
    const name = row.company_name || row.reference_number || `${row.subject_type || "Record"} #${row.subject_id || row.id}`;
    const detail = row.email || row.client?.company_name || row.agent?.company_name || row.assigned_to?.name || row.type || "—";
    const place = row.city || row.country || row.open_date || row.due_date || row.direction || "—";
    const status = row.status || row.direction || row.transport_type || "active";
    const emailParams = row.email ? `?to=${encodeURIComponent(row.email)}&subject=${encodeURIComponent(`Follow-up with ${name}`)}` : "";
    return <tr key={row.id}><td><label className="row-check"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => onToggle(row.id)} /><span><strong>{name}</strong><small>{detail}</small></span></label></td><td>{place}</td><td><span className={`badge ${status}`}>{statusLabels[status] || status}</span></td><td>{row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "—"}</td><td>{onEdit ? <button className="text-button" disabled={converting} onClick={() => onEdit(row)}>Edit</button> : null}{(type === "leads" || type === "clients") && row.email && <><Link className="text-button" href={`/send-email${emailParams}`}><Mail size={14} /> Email</Link><Link className="text-button" href={`/scheduled-emails${emailParams}`}><CalendarClock size={14} /> Schedule</Link></>}{type === "leads" && openLeadStatuses.has(row.status) ? <button className="text-button" disabled={converting} onClick={() => onConvert(row.id)}>Convert</button> : null}<button className="text-button text-red-600" disabled={converting} onClick={() => onDelete(row.id)}>Delete</button></td></tr>;
  })}</tbody></table></div>;
}

function CreateRecordModal({ type, form, setForm, loading, onClose, onSubmit }: { type: "clients" | "agents"; form: Record<string, string>; setForm: (value: any) => void; loading: boolean; onClose: () => void; onSubmit: () => void }) { const update = (key: string, value: string) => setForm((prev: Record<string, string>) => ({ ...prev, [key]: value })); const fields = type === "agents" ? [["company_name", "Company name *"], ["contact_person", "Contact person"], ["email", "Email"], ["phone", "Phone"], ["website", "Website"]] : [["company_name", "Company name *"], ["email", "Email"], ["phone", "Phone"], ["website", "Website"], ["contact_person", "Industry"]]; return <div className="modal-backdrop"><form className="modal lead-modal" onSubmit={e => { e.preventDefault(); onSubmit(); }}><div className="modal-head"><div><p className="eyebrow">New record</p><h3>Add {type === "clients" ? "client" : "agent"}</h3></div><button type="button" className="icon-button" onClick={onClose}><X size={18} /></button></div><div className="lead-form-grid">{fields.map(([key, label]) => <label className="lead-field" key={key}>{label}<input required={key === "company_name"} type={key === "email" ? "email" : "text"} value={form[key]} onChange={e => update(key, e.target.value)} /></label>)}<div className="lead-field lead-field-full"><CountryCitySelect country={form.country} city={form.city} onCountryChange={value => update("country", value)} onCityChange={value => update("city", value)} /></div><label className="lead-field lead-field-full">Notes<textarea value={form.notes} onChange={e => update("notes", e.target.value)} /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={loading}>{loading ? "Saving…" : `Add ${type === "clients" ? "client" : "agent"}`}</button></div></form></div>; }
