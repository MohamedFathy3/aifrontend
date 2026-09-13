"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LayoutDashboard, Search, MessageCircle } from "lucide-react";

export function WorkspaceFrame({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const links = [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }, { href: "/research", label: "AI Research", icon: Search }, { href: "/chat", label: "CRM Chat", icon: MessageCircle }];
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-mark">P</div><div><strong>Pyramidth</strong><span>Sales CRM</span></div></div><nav>{links.map(({ href, label, icon: Icon }) => <Link href={href} key={href} className={pathname === href ? "nav-item active" : "nav-item"}><Icon size={18} /><span>{label}</span></Link>)}</nav><div className="sidebar-footer"><div className="avatar"><Bot size={16} /></div><div className="user-copy"><strong>Sales workspace</strong><span>AI tools</span></div></div></aside><main className="main"><header className="topbar"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div><div className="top-actions"><Link className="secondary-button" href="/dashboard">Back to dashboard</Link></div></header>{children}</main></div>;
}
