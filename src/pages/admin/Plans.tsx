import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { toast } from "sonner";
import { Plus, Tag, DollarSign, AlignLeft, List, Loader2, AlertTriangle, X, Pencil, Mic, PlusCircle } from "lucide-react";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PlansTable from "../../components/table/AdminTables/PlansTable.tsx";
import { useGetAdminPlans, useCreateAdminPlan, useDeleteAdminPlan, useUpdateAdminPlan } from "../../utils/admin";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button.tsx";
import { type SubscriptionPlan } from "../../utils/type";

const planSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.number().min(0, "Le prix doit être positif"),
  annual_price: z.number().min(0, "Le prix annuel doit être positif"),
  includes_audio: z.boolean(),
});

type PlanFormValues = z.infer<typeof planSchema>;

export default function Plans() {
  const { data: plans, isLoading, isError } = useGetAdminPlans();
  const createMutation = useCreateAdminPlan();
  const updateMutation = useUpdateAdminPlan();
  const deleteMutation = useDeleteAdminPlan();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      annual_price: 0,
      includes_audio: false,
    },
  });

  const includesAudio = watch("includes_audio");

  const addBenefit = () => {
    const trimmed = benefitInput.trim();
    if (!trimmed) return;
    setBenefitsList(prev => [...prev, trimmed]);
    setBenefitInput("");
  };

  const removeBenefit = (index: number) => {
    setBenefitsList(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (values: PlanFormValues) => {
    const payload = {
      name: values.name,
      price: values.price,
      annual_price: values.annual_price,
      description: values.description,
      benefits_description: benefitsList,
      includes_audio: values.includes_audio,
    };

    if (editingPlan) {
      updateMutation.mutate({
        id: editingPlan.id,
        data: payload
      }, {
        onSuccess: () => {
          setEditingPlan(null);
          setBenefitsList([]);
          reset();
        }
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setBenefitsList([]);
          reset();
        }
      });
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setValue("name", plan.name);
    setValue("description", plan.description);
    setValue("price", Number(plan.price));
    setValue("annual_price", Number(plan.annual_price));
    setValue("includes_audio", plan.includes_audio ?? false);
    setBenefitsList(plan.benefits_description ?? []);
    setBenefitInput("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    setBenefitsList([]);
    setBenefitInput("");
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
        <p className="text-red-500">Erreur lors du chargement des plans.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Plans" description="Gestion des plans" />
      <PageBreadcrumb pageTitle="Plans" />

      <ComponentCard
        title={editingPlan ? "Modifier le plan" : "Nouveau plan"}
        desc={editingPlan ? `Vous modifiez le plan : ${editingPlan.name}` : "Créez un nouveau plan d'abonnement pour vos utilisateurs"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
                <input
                  {...register("name")}
                  placeholder="Nom du plan"
                  className={`h-11 pl-10 pr-4 w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <div className="relative">
                <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
                <input
                  {...register("description")}
                  placeholder="Description"
                  className={`h-11 pl-10 pr-4 w-full rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90`}
                />
              </div>
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
                <input
                  {...register("price", { valueAsNumber: true })}
                  placeholder="Prix Mensuel"
                  type="number"
                  step="0.01"
                  className={`h-11 pl-10 pr-4 w-full rounded-lg border ${errors.price ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90`}
                />
              </div>
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div className="space-y-1">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
                <input
                  {...register("annual_price", { valueAsNumber: true })}
                  placeholder="Prix Annuel"
                  type="number"
                  step="0.01"
                  className={`h-11 pl-10 pr-4 w-full rounded-lg border ${errors.annual_price ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90`}
                />
              </div>
              {errors.annual_price && <p className="text-xs text-red-500">{errors.annual_price.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <List className="size-4 text-gray-500 dark:text-gray-400" />
              Avantages
            </p>
            <div className="flex gap-2">
              <input
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }}
                placeholder="Ajouter un avantage..."
                className="h-11 px-4 flex-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90"
              />
              <button
                type="button"
                onClick={addBenefit}
                disabled={!benefitInput.trim()}
                className="inline-flex items-center gap-1.5 h-11 px-4 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <PlusCircle className="size-4" />
                Ajouter
              </button>
            </div>
            {benefitsList.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {benefitsList.map((b, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02] px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="flex-1 min-w-0">{b}</span>
                    <button type="button" onClick={() => removeBenefit(i)} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${includesAudio ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
              <Mic size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Inclure l'audio</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Résumés audio et podcasts sans jetons (plan Ultra)</p>
            </div>
            <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${includesAudio ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
              <input type="checkbox" {...register("includes_audio")} className="sr-only" />
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${includesAudio ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>

          <div className="flex justify-end gap-3">
            {editingPlan && (
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
                editingPlan ? <Pencil className="size-4" /> : <Plus className="size-4" />
              )}
              {editingPlan ? "Mettre à jour le plan" : "Ajouter le plan"}
            </button>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Plans existants">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin size-8 text-brand-500" />
          </div>
        ) : (
          <PlansTable
            plans={plans || []}
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
            Êtes-vous sûr de vouloir supprimer ce plan ? Cette action est irréversible.
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
