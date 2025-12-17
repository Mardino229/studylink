import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { mockPayments, type AdminPayment, idToUser } from "./adminMock";

export default function Payments() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const rows = mockPayments;
  const filtered = useMemo(() => {
    return rows.filter((p) => {
      const qmatch = q.trim().length === 0 || idToUser(p.userId).toLowerCase().includes(q.toLowerCase());
      const st = status === "all" || p.status === status;
      return qmatch && st;
    });
  }, [rows, q, status]);

  const total = filtered.reduce((acc, p) => (p.status === "paid" ? acc + p.amount : acc), 0);
  const paid = filtered.filter(p => p.status === "paid").length;
  const failed = filtered.filter(p => p.status === "failed").length;

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Paiements" description="Suivi des paiements" />
      <PageBreadcrumb pageTitle="Paiements" />
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="text-sm text-foreground/70">Total encaissé</div>
          <div className="mt-2 text-3xl font-semibold text-foreground">{total.toFixed(2)} €</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="text-sm text-foreground/70">Paiements réussis</div>
          <div className="mt-2 text-3xl font-semibold text-foreground">{paid}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="text-sm text-foreground/70">Échecs</div>
          <div className="mt-2 text-3xl font-semibold text-foreground">{failed}</div>
        </div>
      </section>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-foreground">Historique des paiements</h2>
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Rechercher (utilisateur)..." className="px-3 py-2 rounded border border-border bg-background" />
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="px-3 py-2 rounded border border-border bg-background">
              <option value="all">Tous</option>
              <option value="paid">Payé</option>
              <option value="failed">Échec</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
            <tr className="text-left border-b border-border">
              <th className="py-2 pr-4">Utilisateur</th>
              <th className="py-2 pr-4">Montant</th>
              <th className="py-2 pr-4">Statut</th>
              <th className="py-2 pr-4">Date</th>
            </tr>
            </thead>
            <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/60">
                <td className="py-2 pr-4 text-foreground">{idToUser(p.userId)}</td>
                <td className="py-2 pr-4">{p.amount.toFixed(2)} {p.currency}</td>
                <td className="py-2 pr-4"><span className="px-2 py-1 rounded border border-border text-foreground/80">{p.status}</span></td>
                <td className="py-2 pr-4">{p.date}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-foreground/60">Aucun paiement</td></tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
