import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", size = "default", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" | "secondary"; size?: "default" | "sm" | "lg" | "icon" }) {
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:pointer-events-none disabled:opacity-50", variant === "default" && "bg-teal-600 text-white shadow-sm hover:bg-teal-700", variant === "outline" && "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50", variant === "secondary" && "bg-slate-100 text-slate-700 hover:bg-slate-200", variant === "ghost" && "text-slate-600 hover:bg-slate-100", size === "default" && "h-10 px-4 py-2", size === "sm" && "h-9 px-3 text-xs", size === "lg" && "h-11 px-6", size === "icon" && "h-10 w-10", className)} {...props} />;
}
