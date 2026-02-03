import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { mockPlans, type AdminPlan } from "./adminMock";
import { toast } from "sonner";
import { Plus, Tag, DollarSign, Trash2 } from "lucide-react";

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
        <h2 className="text-xl font-semibold gradient-text">Nouveau plan</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nom" className="h-10 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-white/5 backdrop-blur-sm focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm" />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
            <input value={price} onChange={(e)=>setPrice(parseFloat(e.target.value)||0)} placeholder="Prix" type="number" className="h-10 pl-9 pr-3 w-32 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-white/5 backdrop-blur-sm focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm" />
          </div>
          <select value={interval} onChange={(e)=>setInterval(e.target.value as AdminPlan["interval"])} className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-white/5 backdrop-blur-sm text-sm">
            <option value="month">Mensuel</option>
            <option value="year">Annuel</option>
          </select>
          <button onClick={addPlan} className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:border-brand-400/30 dark:bg-brand-500/10 dark:text-brand-400">
            <Plus className="size-4" />
            Ajouter
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold gradient-text mb-4">Plans existants</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200/60 dark:border-gray-800/60 bg-gray-50/60 dark:bg-white/[0.02]">
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Prix</th>
                <th className="py-2 pr-4">Intervalle</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id} className="border-b border-gray-200/60 dark:border-gray-800/60 hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4 text-foreground font-medium">{p.name}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs bg-gray-50 text-gray-700 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-gray-700">
                      {p.price.toFixed(2)} €
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${p.interval === 'month' ? 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-400/30' : 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-400/30'}`}>
                      {p.interval === 'month' ? 'Mensuel' : 'Annuel'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <button onClick={()=>removePlan(p.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-400">
                      <Trash2 className="size-4" />
                      Supprimer
                    </button>
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
