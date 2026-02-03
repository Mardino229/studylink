import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { mockFeedbacks, idToUser, type AdminFeedback } from "./adminMock";
import { toast } from "sonner";
import { Search, CheckCircle2, RotateCcw, MessageSquare } from "lucide-react";

export default function Feedbacks() {
  const initials = (fullName: string) => fullName.split(" ").map(n => n[0] || "").join("").slice(0,2).toUpperCase();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [rows, setRows] = useState<AdminFeedback[]>(mockFeedbacks);

  const filtered = useMemo(() => {
    return rows.filter((f) => {
      const qmatch = q.trim().length === 0 || idToUser(f.userId).toLowerCase().includes(q.toLowerCase()) || f.subject.toLowerCase().includes(q.toLowerCase());
      const st = status === "all" || f.status === status;
      return qmatch && st;
    });
  }, [rows, q, status]);

  const setFbStatus = (id: string, next: AdminFeedback["status"]) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
    toast.success("Statut du feedback mis à jour");
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Feedbacks" description="Gestion des retours utilisateurs" />
      <PageBreadcrumb pageTitle="Feedbacks" />
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="size-5 text-blue-500" />
            <h2 className="text-xl font-semibold gradient-text">Feedbacks</h2>
            <span className="text-sm text-foreground/60">• {filtered.length} résultats</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
              <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Rechercher (utilisateur/sujet)..." className="h-10 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-white/5 backdrop-blur-sm focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm" />
            </div>
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-white/5 backdrop-blur-sm text-sm">
              <option value="all">Tous</option>
              <option value="open">Ouverts</option>
              <option value="resolved">Résolus</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {filtered.map(f => (
            <div key={f.id} className="p-4 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-white/5 backdrop-blur-sm hover:bg-gray-50/60 dark:hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 flex items-center justify-center text-xs font-semibold">
                    {initials(idToUser(f.userId))}
                  </div>
                  <div>
                    <div className="text-sm text-foreground/60">{idToUser(f.userId)} • {f.createdAt}</div>
                    <h3 className="font-semibold text-foreground">{f.subject}</h3>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${
                  f.status === "resolved"
                    ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-400/30"
                    : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-400/30"
                }`}>
                  {f.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{f.message}</p>
              <div className="mt-3 flex gap-2">
                {f.status !== "resolved" ? (
                  <button onClick={()=>setFbStatus(f.id, "resolved")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 dark:border-green-400/30 dark:bg-green-500/10 dark:text-green-400">
                    <CheckCircle2 className="size-4" />
                    Marquer résolu
                  </button>
                ) : (
                  <button onClick={()=>setFbStatus(f.id, "open")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-400">
                    <RotateCcw className="size-4" />
                    Rouvrir
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-foreground/60 text-center py-6">Aucun feedback</div>
          )}
        </div>
      </div>
    </div>
  );
}
