"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bot, LayoutDashboard, Search, MessageCircle, Mail, Linkedin, CalendarDays, Menu, X, ArrowUpRight } from "lucide-react";

export function WorkspaceFrame({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }, { href: "/inbox", label: "Gmail Inbox", icon: Mail }, { href: "/calendar", label: "Calendar", icon: CalendarDays }, { href: "/research", label: "AI Research", icon: Search }, { href: "/chat", label: "CRM Chat", icon: MessageCircle }, { href: "/email-coach", label: "Email Coach", icon: Mail }, { href: "/linkedin", label: "LinkedIn", icon: Linkedin }];
  return <div className="app-shell"><aside className={open ? "sidebar open" : "sidebar"}><div className="brand"><div className="brand-mark">P</div><div><strong>Pyramidth</strong><span>Sales CRM</span></div><button className="mobile-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></button></div><nav>{links.map(({ href, label, icon: Icon }) => <Link href={href} key={href} onClick={() => setOpen(false)} className={pathname === href ? "nav-item active" : "nav-item"}><Icon size={18} /><span>{label}</span>{pathname === href && <ArrowUpRight className="nav-arrow" size={14} />}</Link>)}</nav><div className="sidebar-footer"><div className="avatar"><Bot size={16} /></div><div className="user-copy"><strong>Sales workspace</strong><span>AI tools</span></div></div></aside><main className="main"><header className="topbar"><div><button className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={22} /></button><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div></div><div className="top-actions"><Link className="secondary-button" href="/dashboard">Dashboard</Link></div></header>{children}</main></div>;
}
