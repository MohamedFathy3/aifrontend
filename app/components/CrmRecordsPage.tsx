"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { WorkspaceFrame } from "./WorkspaceFrame";

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
  const page = labels[type];

  useEffect(() => { if (!isLoading && (isError || user === null)) router.replace("/login"); }, [isLoading, isError, user, router]);
  const records = useQuery<{ data: any[] }>({ queryKey: [type, search], queryFn: async () => (await apiClient.get(`/v1/${type}`, { params: { search: search || undefined } })).data, enabled: !!user });
  const convert = useMutation({ mutationFn: (id: number) => apiClient.post(`/v1/leads/${id}/convert`), onSuccess: () => { setNotice("Lead converted to client."); queryClient.invalidateQueries({ queryKey: [type] }); queryClient.invalidateQueries({ queryKey: ["clients"] }); } });
  const remove = useMutation({ mutationFn: (id: number) => apiClient.delete(`/v1/${type}/${id}`), onSuccess: () => { setNotice("Record deleted."); queryClient.invalidateQueries({ queryKey: [type] }); } });

  if (isLoading || !user) return <div className="loading">Loading your workspace…</div>;
  const rows = records.data?.data ?? [];
  return <WorkspaceFrame title={page.title} eyebrow={page.eyebrow}>
    {notice && <div className="mx-auto flex max-w-[1500px] items-center gap-2 px-5 pt-5 text-sm text-emerald-700 md:px-8"><CheckCircle2 size={16} /> {notice}<button className="ml-auto" onClick={() => setNotice("")}><X size={15} /></button></div>}
    <main className="content">
      <div className="page-intro"><div><p className="eyebrow">{page.eyebrow}</p><h2>{page.title}</h2><p>{page.description}</p></div><span className="panel-count">{rows.length} shown</span></div>
      <div className="mb-4 flex max-w-md items-center gap-2"><input className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${page.title.toLowerCase()}…`} /></div>
      <section className="panel"><RecordTable rows={rows} type={type} onConvert={(id) => convert.mutate(id)} onDelete={(id) => { if (window.confirm("Delete this record?")) remove.mutate(id); }} converting={convert.isPending || remove.isPending} /></section>
    </main>
  </WorkspaceFrame>;
}

function RecordTable({ rows, type, onConvert, onDelete, converting }: { rows: any[]; type: CrmType; onConvert: (id: number) => void; onDelete: (id: number) => void; converting: boolean }) {
  if (!rows.length) return <div className="empty"><ClipboardList size={22} /><span>No records found yet.</span></div>;
  return <div className="table-wrap"><table><thead><tr><th>Name / reference</th><th>Location / detail</th><th>Status</th><th>Updated</th><th /></tr></thead><tbody>{rows.map(row => {
    const name = row.company_name || row.reference_number || `${row.subject_type || "Record"} #${row.subject_id || row.id}`;
    const detail = row.email || row.client?.company_name || row.agent?.company_name || row.assigned_to?.name || row.type || "—";
    const place = row.city || row.country || row.open_date || row.due_date || row.direction || "—";
    const status = row.status || row.direction || row.transport_type || "active";
    return <tr key={row.id}><td><strong>{name}</strong><small>{detail}</small></td><td>{place}</td><td><span className={`badge ${status}`}>{statusLabels[status] || status}</span></td><td>{row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "—"}</td><td>{type === "leads" && openLeadStatuses.has(row.status) ? <button className="text-button" disabled={converting} onClick={() => onConvert(row.id)}>Convert</button> : null}<button className="text-button text-red-600" disabled={converting} onClick={() => onDelete(row.id)}>Delete</button></td></tr>;
  })}</tbody></table></div>;
}
