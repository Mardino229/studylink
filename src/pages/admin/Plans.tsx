import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { mockPlans, type AdminPlan } from "./adminMock";
import { toast } from "sonner";

export default function Plans() {
  const [rows, setRows] = useState<AdminPlan[]>(mockPlans);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [interval, setInterval] = useState<AdminPlan["interval"]>("month");

  const addPlan = () => {
    if (!name || price <= 0) {
      toast.error("Veuillez renseigner un nom et un prix valide");
      return;
    }
    const id = `p${Math.random().toString(36).slice(2, 7)}`;
    const next: AdminPlan = { id, name, price, interval, features: [] };
    setRows((r) => [next, ...r]);
    setName(""); setPrice(0); setInterval("month");
    toast.success("Plan ajouté");
  };
  const removePlan = (id: string) => {
    setRows((r) => r.filter(p => p.id !== id));
    toast.success("Plan supprimé");
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Plans" description="Gestion des plans" />
      <PageBreadcrumb pageTitle="Plans" />
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Nouveau plan</h2>
        <div className="flex flex-wrap gap-2">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nom" className="px-3 py-2 rounded border border-border bg-background" />
          <input value={price} onChange={(e)=>setPrice(parseFloat(e.target.value)||0)} placeholder="Prix" type="number" className="px-3 py-2 rounded border border-border bg-background w-28" />
          <select value={interval} onChange={(e)=>setInterval(e.target.value as AdminPlan["interval"])} className="px-3 py-2 rounded border border-border bg-background">
            <option value="month">Mensuel</option>
            <option value="year">Annuel</option>
          </select>
          <button onClick={addPlan} className="px-3 py-2 rounded border border-border hover:bg-background">Ajouter</button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">Plans existants</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Prix</th>
                <th className="py-2 pr-4">Intervalle</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2 pr-4 text-foreground">{p.name}</td>
                  <td className="py-2 pr-4">{p.price.toFixed(2)} €</td>
                  <td className="py-2 pr-4">{p.interval}</td>
                  <td className="py-2 pr-4">
                    <button onClick={()=>removePlan(p.id)} className="px-3 py-1 rounded border border-border hover:bg-background">Supprimer</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-foreground/60">Aucun plan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
