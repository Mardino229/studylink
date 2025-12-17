import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { mockUsers, type AdminUser } from "./adminMock";
import { toast } from "sonner";

export default function Users() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [rows, setRows] = useState<AdminUser[]>(mockUsers);

  const filtered = useMemo(() => {
    return rows.filter((u) => {
      const matchQ = q.trim().length === 0 || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase());
      const matchRole = role === "all" || u.role === role;
      const matchStatus = status === "all" || u.status === status;
      return matchQ && matchRole && matchStatus;
    });
  }, [rows, q, role, status]);

  const setUserStatus = (id: string, next: AdminUser["status"]) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
    toast.success("Statut mis à jour");
  };
  const toggleAdmin = (id: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, role: r.role === "admin" ? "user" : "admin" } : r)));
    toast.success("Rôle mis à jour");
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Utilisateurs" description="Gestion des utilisateurs" />
      <PageBreadcrumb pageTitle="Utilisateurs" />
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-foreground">Liste des utilisateurs</h2>
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Rechercher..." className="px-3 py-2 rounded border border-border bg-background" />
            <select value={role} onChange={(e)=>setRole(e.target.value)} className="px-3 py-2 rounded border border-border bg-background">
              <option value="all">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="px-3 py-2 rounded border border-border bg-background">
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
              <tr className="text-left border-b border-border">
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Rôle</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border/60">
                  <td className="py-2 pr-4 text-foreground">{u.name}</td>
                  <td className="py-2 pr-4 text-foreground/80">{u.email}</td>
                  <td className="py-2 pr-4">
                    <span className="px-2 py-1 rounded border border-border text-foreground/80">{u.role}</span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="px-2 py-1 rounded border border-border text-foreground/80">{u.status}</span>
                  </td>
                  <td className="py-2 pr-4 flex flex-wrap gap-2">
                    <button onClick={()=>toggleAdmin(u.id)} className="px-3 py-1 rounded border border-border hover:bg-background">
                      {u.role === "admin" ? "Rétrograder" : "Promouvoir"}
                    </button>
                    {u.status !== "active" && (
                      <button onClick={()=>setUserStatus(u.id, "active")} className="px-3 py-1 rounded border border-border hover:bg-background">Activer</button>
                    )}
                    {u.status !== "blocked" && (
                      <button onClick={()=>setUserStatus(u.id, "blocked")} className="px-3 py-1 rounded border border-border hover:bg-background">Bloquer</button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-foreground/60">Aucun résultat</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
