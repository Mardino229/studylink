import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { mockUsers, type AdminUser } from "./adminMock";
import { toast } from "sonner";
import { Search, CheckCircle2, XCircle } from "lucide-react";

export default function Users() {
  const initials = (fullName: string) => fullName.split(" ").map(n => n[0] || "").join("").slice(0,2).toUpperCase();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [rows, setRows] = useState<AdminUser[]>(mockUsers);

  const filtered = useMemo(() => {
    return rows.filter((u) => {
      const matchQ = q.trim().length === 0 || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase());
      const matchStatus = status === "all" || u.status === status;
      return matchQ && matchStatus;
    });
  }, [rows, q, status]);

  const setUserStatus = (id: string, next: AdminUser["status"]) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
    toast.success("Statut mis à jour");
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Utilisateurs" description="Gestion des utilisateurs" />
      <PageBreadcrumb pageTitle="Utilisateurs" />
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold gradient-text">Liste des utilisateurs</h2>
            <span className="text-sm text-foreground/60">• {filtered.length} résultats</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
              <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Rechercher..." className="h-10 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-white/5 backdrop-blur-sm focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm" />
            </div>
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-white/5 backdrop-blur-sm text-sm">
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="blocked">Bloqué</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200/60 dark:border-gray-800/60 bg-gray-50/60 dark:bg-white/[0.02]">
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4 hidden md:table-cell">Email</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-200/60 dark:border-gray-800/60 hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 flex items-center justify-center text-xs font-semibold">
                        {initials(u.name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">{u.name}</span>
                        <span className="text-xs text-foreground/60 md:hidden">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell text-foreground/80">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${
                      u.status === "active"
                        ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-400/30"
                        : u.status === "pending"
                        ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-400/30"
                        : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-400/30"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      {u.status !== "active" && (
                        <button onClick={()=>setUserStatus(u.id, "active")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 dark:border-green-400/30 dark:bg-green-500/10 dark:text-green-400">
                          <CheckCircle2 className="size-4" />
                          Activer
                        </button>
                      )}
                      {u.status !== "blocked" && (
                        <button onClick={()=>setUserStatus(u.id, "blocked")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-400">
                          <XCircle className="size-4" />
                          Bloquer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-foreground/60">Aucun résultat</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
