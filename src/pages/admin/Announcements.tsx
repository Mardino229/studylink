import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { mockAnnouncements, type AdminAnnouncement } from "./adminMock";
import { toast } from "sonner";

export default function Announcements() {
  const [rows, setRows] = useState<AdminAnnouncement[]>(mockAnnouncements);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const add = () => {
    if (!title || !content) {
      toast.error("Renseignez un titre et un contenu");
      return;
    }
    const id = `a${Math.random().toString(36).slice(2,7)}`;
    const createdAt = new Date().toISOString().slice(0,10);
    setRows((r) => [{ id, title, content, createdAt }, ...r]);
    setTitle(""); setContent("");
    toast.success("Annonce publiée");
  };
  const remove = (id: string) => {
    setRows((r)=> r.filter(a=>a.id!==id));
    toast.success("Annonce supprimée");
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Annonces" description="Gestion des annonces" />
      <PageBreadcrumb pageTitle="Annonces" />

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Nouvelle annonce</h2>
        <div className="mt-4 space-y-3 max-w-2xl">
          <label className="block text-sm text-foreground">
            Titre
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Titre" className="mt-1 w-full px-3 py-2 rounded border border-border bg-background" />
          </label>
          <label className="block text-sm text-foreground">
            Contenu
            <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Contenu" className="mt-1 w-full px-3 py-2 rounded border border-border bg-background" rows={4} />
          </label>
          <div className="pt-2 flex justify-end">
            <button onClick={add} className="px-3 py-2 rounded border border-border hover:bg-background">Publier</button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">Annonces</h2>
        <div className="space-y-3">
          {rows.map(a => (
            <div key={a.id} className="p-4 rounded border border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{a.title}</h3>
                <div className="text-xs text-foreground/60">{a.createdAt}</div>
              </div>
              <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{a.content}</p>
              <div className="mt-3">
                <button onClick={()=>remove(a.id)} className="px-3 py-1 rounded border border-border hover:bg-background">Supprimer</button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="text-sm text-foreground/60 text-center py-6">Aucune annonce</div>
          )}
        </div>
      </div>
    </div>
  );
}
