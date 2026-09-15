"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Bot, Building2, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, LayoutDashboard, Linkedin, Mail, MapPinned, Menu, MessageCircle, Plus, Search, Ship, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/shipments", label: "Shipments", icon: Ship },
  { href: "/shipments/new", label: "Add shipment", icon: Plus },
  { href: "/follow-ups", label: "Follow-ups", icon: ClipboardList },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/locations", label: "Locations", icon: MapPinned },
  { href: "/inbox", label: "Gmail Inbox", icon: Mail },
  { href: "/send-email", label: "Send email", icon: Mail },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/calendar/new", label: "Add appointment", icon: Plus },
  { href: "/research", label: "AI Research", icon: Search },
  { href: "/chat", label: "CRM Chat", icon: MessageCircle },
  { href: "/email-coach", label: "Email Coach", icon: Mail },
  { href: "/linkedin", label: "LinkedIn", icon: Linkedin },
];

export function WorkspaceFrame({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { setCollapsed(window.localStorage.getItem("pyramidth-sidebar-collapsed") === "true"); }, []);
  function toggleCollapsed() { setCollapsed(value => { const next = !value; window.localStorage.setItem("pyramidth-sidebar-collapsed", String(next)); return next; }); }
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <aside className={cn("fixed inset-y-0 left-0 z-50 flex -translate-x-full flex-col border-r border-slate-200 bg-white p-4 shadow-xl transition-all duration-200 lg:translate-x-0 lg:shadow-none", collapsed ? "lg:w-[76px]" : "lg:w-64", open && "translate-x-0 w-64")}>
      <div className={cn("flex items-center gap-3 px-2 py-3", collapsed && "lg:justify-center lg:px-0")}><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-lg font-black text-white shadow-lg shadow-slate-900/15">P</div><div className={cn(collapsed && "lg:hidden")}><p className="font-bold tracking-tight text-slate-900">Pyramidth</p><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">Sales CRM</p></div><button className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="my-6 h-px bg-slate-100" />
      <p className={cn("px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400", collapsed && "lg:hidden")}>Workspace</p>
      <nav className="grid gap-1">{links.map(({ href, label, icon: Icon }) => { const active = href.includes("?") ? pathname === "/dashboard" && new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("tab") === href.split("=")[1] : pathname === href && !links.some(item => item.href.includes("?") && pathname === item.href.split("?")[0]); return <Link href={href} key={href} title={collapsed ? label : undefined} onClick={() => setOpen(false)} className={cn("group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900", collapsed && "lg:justify-center lg:px-0", active && "bg-teal-50 text-teal-700")}>{<Icon size={17} className={cn(active ? "text-teal-600" : "text-slate-400 group-hover:text-slate-700")} />}<span className={cn(collapsed && "lg:hidden")}>{label}</span>{active && <ArrowUpRight className={cn("ml-auto", collapsed && "lg:hidden")} size={14} />}</Link>; })}</nav>
      <div className={cn("mt-auto rounded-xl bg-slate-50 p-3", collapsed && "lg:bg-transparent lg:p-0")}><div className={cn("flex items-center gap-3", collapsed && "lg:justify-center")}><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-100 text-teal-700"><Bot size={17} /></div><div className={cn(collapsed && "lg:hidden")}><p className="text-xs font-semibold text-slate-800">Sales workspace</p><p className="text-[11px] text-slate-400">AI tools enabled</p></div></div></div>
    </aside>
    <div className={cn("transition-[padding] duration-200 lg:pl-64", collapsed && "lg:pl-[76px]")}><header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur md:px-8"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></Button><Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={toggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}</Button><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{eyebrow}</p><h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{title}</h1></div></div><Link href="/dashboard"><Button variant="outline" size="sm">Dashboard</Button></Link></header>{children}</div>
  </div>;
}
