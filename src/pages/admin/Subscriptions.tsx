import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { mockSubscriptions, idToUser, idToPlan, type AdminSubscription } from "./adminMock";
import { toast } from "sonner";

export default function Subscriptions() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [rows, setRows] = useState<AdminSubscription[]>(mockSubscriptions);

  const filtered = useMemo(() => {
    return rows.filter((s) => {
      const qmatch = q.trim().length === 0 || idToUser(s.userId).toLowerCase().includes(q.toLowerCase()) || idToPlan(s.planId).toLowerCase().includes(q.toLowerCase());
      const st = status === "all" || s.status === status;
      return qmatch && st;
    });
  }, [rows, q, status]);

  const setSubStatus = (id: string, next: AdminSubscription["status"]) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
    toast.success("Statut d'abonnement mis à jour");
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Abonnements" description="Gestion des abonnements" />
      <PageBreadcrumb pageTitle="Abonnements" />
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-foreground">Abonnements</h2>
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Rechercher (user/plan)..." className="px-3 py-2 rounded border border-border bg-background" />
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="px-3 py-2 rounded border border-border bg-background">
              <option value="all">Tous</option>
              <option value="active">Actif</option>
              <option value="past_due">En retard</option>
              <option value="canceled">Annulé</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
            <tr className="text-left border-b border-border">
              <th className="py-2 pr-4">Utilisateur</th>
              <th className="py-2 pr-4">Plan</th>
              <th className="py-2 pr-4">Statut</th>
              <th className="py-2 pr-4">Renouvellement</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
            </thead>
            <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-border/60">
                <td className="py-2 pr-4 text-foreground">{idToUser(s.userId)}</td>
                <td className="py-2 pr-4 text-foreground/80">{idToPlan(s.planId)}</td>
                <td className="py-2 pr-4"><span className="px-2 py-1 rounded border border-border text-foreground/80">{s.status}</span></td>
                <td className="py-2 pr-4">{s.renewAt}</td>
                <td className="py-2 pr-4 flex flex-wrap gap-2">
                  {s.status !== "active" && (
                    <button onClick={()=>setSubStatus(s.id, "active")} className="px-3 py-1 rounded border border-border hover:bg-background">Activer</button>
                  )}
                  {s.status !== "canceled" && (
                    <button onClick={()=>setSubStatus(s.id, "canceled")} className="px-3 py-1 rounded border border-border hover:bg-background">Annuler</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-foreground/60">Aucun résultat</td></tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
