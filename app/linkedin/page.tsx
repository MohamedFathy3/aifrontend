"use client";
import { useEffect, useState } from "react";
import { Linkedin, ShieldCheck, Unplug } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { WorkspaceFrame } from "@/app/components/WorkspaceFrame";

export default function LinkedInPage() {
  const [profile, setProfile] = useState<any>(null); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function load() { try { const r = await apiClient.get("/v1/linkedin/profile"); setProfile(r.data); } catch { setProfile(null); } }
  useEffect(() => { load(); }, []);
  async function connect() { setBusy(true); try { const r = await apiClient.get("/v1/linkedin/connect"); const tab = window.open(r.data.url, "_blank", "noopener,noreferrer"); if (!tab) setMessage("Please allow pop-ups for this site to connect LinkedIn."); else setMessage("LinkedIn opened in a new tab. Return here after approving access."); } catch (e: any) { setMessage(e?.response?.data?.message || "LinkedIn OAuth is not configured."); } finally { setBusy(false); } }
  async function disconnect() { await apiClient.delete("/v1/linkedin/disconnect"); setProfile(null); setMessage("LinkedIn disconnected."); }
  return <WorkspaceFrame title="LinkedIn" eyebrow="Official account connection"><main className="standalone-page"><div className="content"><div className="page-intro"><div><p className="eyebrow">Official LinkedIn connection</p><h1>Connect LinkedIn safely</h1><p>Use LinkedIn’s official OAuth and approved profile API. No automated profile scraping or account automation.</p></div></div><section className="panel linkedin-card"><div className="linkedin-icon"><Linkedin size={28} /></div><h2>{profile ? `Connected as ${profile.name || profile.email || "LinkedIn member"}` : "Connect your LinkedIn account"}</h2><p>{profile ? "Your authorized profile data is available to this workspace." : "Connect to access only the profile information permitted by your LinkedIn application."}</p>{profile ? <><div className="linkedin-profile"><strong>{profile.name || "LinkedIn profile"}</strong>{profile.email && <span>{profile.email}</span>}</div><button className="secondary-button" onClick={disconnect}><Unplug size={15} /> Disconnect</button></> : <button className="primary-button" disabled={busy} onClick={connect}><ShieldCheck size={15} /> {busy ? "Opening LinkedIn…" : "Connect with LinkedIn"}</button>}{message && <div className="notice">{message}</div>}</section></div></main></WorkspaceFrame>;
}
