import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { toast } from "sonner";
import { Plus, Tag, AlignLeft, List, Loader2, AlertTriangle, X, Pencil, LinkIcon, Calendar } from "lucide-react";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import AnnouncementsTable from "../../components/table/AdminTables/AnnouncementsTable.tsx";
import { useGetAdminAnnouncements, useCreateAdminAnnouncement, useUpdateAdminAnnouncement, useDeleteAdminAnnouncement } from "../../utils/admin";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button.tsx";
import { type Announcement } from "../../utils/type";

const announcementSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  url: z.string().url("URL invalide").optional().or(z.literal("")),
  type: z.enum(["announcement", "survey"]),
  deadline: z.string().optional().or(z.literal("")),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function Announcements() {
  const { data: items, isLoading, isError } = useGetAdminAnnouncements();
  const createMutation = useCreateAdminAnnouncement();
  const updateMutation = useUpdateAdminAnnouncement();
  const deleteMutation = useDeleteAdminAnnouncement();

  const [deleteId, setDeleteId] = useState<StringConstructor | null>(null);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      url: "",
      type: "announcement",
      deadline: "",
    },
  });

  const onSubmit = (values: AnnouncementFormValues) => {
    const payload = {
      title: values.title,
      content: values.content,
      url: values.url || null,
      type: values.type,
      deadline: values.deadline || null,
    };

    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        data: payload
      }, {
        onSuccess: () => {
          setEditingItem(null);
          reset();
        }
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          reset();
        }
      });
    }
  };

  const handleEdit = (item: Announcement) => {
    setEditingItem(item);
    setValue("title", item.title);
    setValue("content", item.content);
    setValue("url", item.url || "");
    setValue("type", item.type);
    setValue("deadline", item.deadline ? item.deadline.slice(0, 16) : "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    reset();
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
        }
      });
    }
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-red-500">Erreur lors du chargement des annonces.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Annonces & Sondages" description="Gestion des annonces et sondages" />
      <PageBreadcrumb pageTitle="Annonces & Sondages" />

      <ComponentCard
        title={editingItem ? "Modifier l'élément" : "Nouvel élément"}
        desc={editingItem ? `Vous modifiez : ${editingItem.title}` : "Créez une nouvelle annonce ou un sondage pour les étudiants"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
                <input
                  {...register("title")}
                  placeholder="Ex: Maintenance planifiée"
                  className={`h-11 pl-10 pr-4 w-full rounded-lg border ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90`}
                />
              </div>
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <div className="relative">
                <List className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
                <select
                  {...register("type")}
                  className="h-11 pl-10 pr-4 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90 appearance-none"
                >
                  <option value="announcement">Annonce</option>
                  <option value="survey">Sondage</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contenu</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 size-4 text-gray-500 dark:text-gray-400" />
              <textarea
                {...register("content")}
                placeholder="Détails de l'annonce ou du sondage..."
                rows={3}
                className={`pl-10 pr-4 py-3 w-full rounded-lg border ${errors.content ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90`}
              />
            </div>
            {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL (Optionnel)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
                <input
                  {...register("url")}
                  placeholder="https://..."
                  className={`h-11 pl-10 pr-4 w-full rounded-lg border ${errors.url ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90`}
                />
              </div>
              {errors.url && <p className="text-xs text-red-500">{errors.url.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date d'échéance (Optionnel)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
                <input
                  {...register("deadline")}
                  type="datetime-local"
                  className="h-11 pl-10 pr-4 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {editingItem && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium text-sm"
              >
                <X className="size-4" />
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                editingItem ? <Pencil className="size-4" /> : <Plus className="size-4" />
              )}
              {editingItem ? "Mettre à jour" : "Ajouter l'élément"}
            </button>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Éléments existants">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin size-8 text-brand-500" />
          </div>
        ) : (
          <AnnouncementsTable
            announcements={items || []}
            onRemove={(id) => setDeleteId(id)}
            onEdit={handleEdit}
          />
        )}
      </ComponentCard>

      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} className="max-w-[400px]">
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-500 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Confirmer la suppression
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteId(null)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="animate-spin size-4" /> : "Supprimer"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
