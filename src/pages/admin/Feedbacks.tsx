import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { mockFeedbacks, idToUser, type AdminFeedback } from "./adminMock";
import { toast } from "sonner";

export default function Feedbacks() {
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-foreground">Feedbacks</h2>
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Rechercher (utilisateur/sujet)..." className="px-3 py-2 rounded border border-border bg-background" />
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="px-3 py-2 rounded border border-border bg-background">
              <option value="all">Tous</option>
              <option value="open">Ouverts</option>
              <option value="resolved">Résolus</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {filtered.map(f => (
            <div key={f.id} className="p-4 rounded border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-foreground/60">{idToUser(f.userId)} • {f.createdAt}</div>
                  <h3 className="font-semibold text-foreground">{f.subject}</h3>
                </div>
                <span className="px-2 py-1 rounded border border-border text-foreground/80">{f.status}</span>
              </div>
              <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{f.message}</p>
              <div className="mt-3 flex gap-2">
                {f.status !== "resolved" ? (
                  <button onClick={()=>setFbStatus(f.id, "resolved")} className="px-3 py-1 rounded border border-border hover:bg-background">Marquer résolu</button>
                ) : (
                  <button onClick={()=>setFbStatus(f.id, "open")} className="px-3 py-1 rounded border border-border hover:bg-background">Rouvrir</button>
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
