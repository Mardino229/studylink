import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { mockAnnouncements, type AdminAnnouncement } from "./adminMock";
import { toast } from "sonner";
import { Megaphone, Send, Trash2, Type, AlignLeft } from "lucide-react";

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
        <div className="flex items-center gap-2">
          <Megaphone className="size-5 text-blue-500" />
          <h2 className="text-xl font-semibold gradient-text">Nouvelle annonce</h2>
        </div>
        <div className="mt-4 space-y-3 max-w-2xl">
          <label className="block text-sm text-foreground">
            Titre
            <div className="relative mt-1">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
              <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Titre" className="h-10 w-full pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-white/5 backdrop-blur-sm focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm" />
            </div>
          </label>
          <label className="block text-sm text-foreground">
            Contenu
            <div className="relative mt-1">
              <AlignLeft className="absolute left-3 top-3 size-4 text-gray-500 dark:text-gray-400" />
              <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Contenu" className="w-full h-28 pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-white/5 backdrop-blur-sm focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm" rows={4} />
            </div>
          </label>
          <div className="pt-2 flex justify-end">
            <button onClick={add} className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:border-brand-400/30 dark:bg-brand-500/10 dark:text-brand-400">
              <Send className="size-4" />
              Publier
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="size-5 text-blue-500" />
          <h2 className="text-xl font-semibold gradient-text">Annonces</h2>
        </div>
        <div className="space-y-3">
          {rows.map(a => (
            <div key={a.id} className="p-4 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-white/5 backdrop-blur-sm hover:bg-gray-50/60 dark:hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{a.title}</h3>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs bg-gray-50 text-gray-700 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-gray-700">{a.createdAt}</div>
              </div>
              <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{a.content}</p>
              <div className="mt-3">
                <button onClick={()=>remove(a.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-400">
                  <Trash2 className="size-4" />
                  Supprimer
                </button>
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
