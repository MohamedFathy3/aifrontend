"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Bot, CalendarDays, LayoutDashboard, Linkedin, Mail, Menu, MessageCircle, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/inbox", label: "Gmail Inbox", icon: Mail },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/research", label: "AI Research", icon: Search },
  { href: "/chat", label: "CRM Chat", icon: MessageCircle },
  { href: "/email-coach", label: "Email Coach", icon: Mail },
  { href: "/linkedin", label: "LinkedIn", icon: Linkedin },
];

export function WorkspaceFrame({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col border-r border-slate-200 bg-white p-4 shadow-xl transition-transform lg:translate-x-0 lg:shadow-none", open && "translate-x-0")}>
      <div className="flex items-center gap-3 px-2 py-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-lg font-black text-white shadow-lg shadow-slate-900/15">P</div><div><p className="font-bold tracking-tight text-slate-900">Pyramidth</p><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">Sales CRM</p></div><button className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="my-6 h-px bg-slate-100" />
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</p>
      <nav className="grid gap-1">{links.map(({ href, label, icon: Icon }) => <Link href={href} key={href} onClick={() => setOpen(false)} className={cn("group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900", pathname === href && "bg-teal-50 text-teal-700")}>{<Icon size={17} className={cn(pathname === href ? "text-teal-600" : "text-slate-400 group-hover:text-slate-700")} />}<span>{label}</span>{pathname === href && <ArrowUpRight className="ml-auto" size={14} />}</Link>)}</nav>
      <div className="mt-auto rounded-xl bg-slate-50 p-3"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-teal-100 text-teal-700"><Bot size={17} /></div><div><p className="text-xs font-semibold text-slate-800">Sales workspace</p><p className="text-[11px] text-slate-400">AI tools enabled</p></div></div></div>
    </aside>
    <div className="lg:pl-64"><header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur md:px-8"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></Button><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{eyebrow}</p><h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{title}</h1></div></div><Link href="/dashboard"><Button variant="outline" size="sm">Dashboard</Button></Link></header>{children}</div>
  </div>;
}
