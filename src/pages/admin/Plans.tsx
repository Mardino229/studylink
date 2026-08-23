import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { Plus, Tag, DollarSign, AlignLeft, List, Loader2, AlertTriangle, X, Pencil, Mic, PlusCircle } from "lucide-react";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PlansTable from "../../components/table/AdminTables/PlansTable.tsx";
import { useGetAdminPlans, useCreateAdminPlan, useDeleteAdminPlan, useUpdateAdminPlan, useGetAdminPlanBilingual } from "../../utils/admin";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button.tsx";
import { type SubscriptionPlan } from "../../utils/type";

const planSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description_fr: z.string().min(1, "La description FR est requise"),
  description_en: z.string().min(1, "La description EN est requise"),
  price: z.number().min(0, "Le prix doit être positif"),
  annual_price: z.number().min(0, "Le prix annuel doit être positif"),
  includes_audio: z.boolean(),
});

type PlanFormValues = z.infer<typeof planSchema>;

function useBenefitList() {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const add = () => {
    const t = input.trim();
    if (!t) return;
    setItems(prev => [...prev, t]);
    setInput("");
  };

  const remove = (i: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== i));
    if (editIndex === i) { setEditIndex(null); setEditValue(""); }
  };

  const startEdit = (i: number, val: string) => { setEditIndex(i); setEditValue(val); };

  const saveEdit = () => {
    if (editIndex === null) return;
    const t = editValue.trim();
    if (t) setItems(prev => prev.map((b, i) => i === editIndex ? t : b));
    setEditIndex(null); setEditValue("");
  };

  const reset = (list: string[] = []) => {
    setItems(list); setInput(""); setEditIndex(null); setEditValue("");
  };

  return { items, input, setInput, editIndex, editValue, setEditValue, add, remove, startEdit, saveEdit, reset };
}

function BenefitListEditor({ label, state }: { label: string; state: ReturnType<typeof useBenefitList> }) {
  const { items, input, setInput, editIndex, editValue, setEditValue, add, remove, startEdit, saveEdit } = state;
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <List className="size-4 text-gray-500 dark:text-gray-400" />
        {label}
      </p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Ajouter un avantage..."
          className="h-10 px-3 flex-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90"
        />
        <button
          type="button"
          onClick={add}
          disabled={!input.trim()}
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <PlusCircle className="size-4" />
          Ajouter
        </button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1 pt-1">
          {items.map((b, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02] px-3 py-1.5">
              {editIndex === i ? (
                <>
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
                      if (e.key === 'Escape') { setEditValue(""); }
                    }}
                    onBlur={saveEdit}
                    className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none border-b border-brand-400"
                  />
                  <button type="button" onClick={saveEdit} className="shrink-0 text-brand-500 hover:text-brand-600 text-xs font-medium">OK</button>
                </>
              ) : (
                <>
                  <span
                    className="flex-1 min-w-0 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    onClick={() => startEdit(i, b)}
                    title="Cliquer pour modifier"
                  >{b}</span>
                  <button type="button" onClick={() => remove(i)} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                    <X className="size-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Plans() {
  const { data: plans, isLoading, isError } = useGetAdminPlans();
  const createMutation = useCreateAdminPlan();
  const updateMutation = useUpdateAdminPlan();
  const deleteMutation = useDeleteAdminPlan();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const benefitsFr = useBenefitList();
  const benefitsEn = useBenefitList();

  const { data: bilingualData } = useGetAdminPlanBilingual(editingPlan?.id ?? null);

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
      description_fr: "",
      description_en: "",
      price: 0,
      annual_price: 0,
      includes_audio: false,
    },
  });

  const includesAudio = watch("includes_audio");

  const onSubmit = (values: PlanFormValues) => {
    const payload = {
      name: values.name,
      price: values.price,
      annual_price: values.annual_price,
      includes_audio: values.includes_audio,
      description_fr: values.description_fr,
      description_en: values.description_en,
      benefits_description_fr: benefitsFr.items,
      benefits_description_en: benefitsEn.items,
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: payload }, {
        onSuccess: () => {
          setEditingPlan(null);
          benefitsFr.reset();
          benefitsEn.reset();
          reset();
        }
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          benefitsFr.reset();
          benefitsEn.reset();
          reset();
        }
      });
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setValue("name", plan.name);
    setValue("price", Number(plan.price));
    setValue("annual_price", Number(plan.annual_price));
    setValue("includes_audio", plan.includes_audio ?? false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When bilingual data loads, fill in the FR/EN fields
  useEffect(() => {
    if (!bilingualData || !editingPlan || bilingualData.id !== editingPlan.id) return;
    setValue("description_fr", bilingualData.description_fr ?? "");
    setValue("description_en", bilingualData.description_en ?? "");
    benefitsFr.reset(bilingualData.benefits_description_fr ?? []);
    benefitsEn.reset(bilingualData.benefits_description_en ?? []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bilingualData]);

  const cancelEdit = () => {
    setEditingPlan(null);
    benefitsFr.reset();
    benefitsEn.reset();
    reset();
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-red-500">Erreur lors du chargement des plans.</p>
      </div>
    );
  }

  const inputCls = (hasError: boolean) =>
    `h-11 pl-10 pr-4 w-full rounded-lg border ${hasError ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90`;

  const textareaCls = (hasError: boolean) =>
    `px-3 py-2.5 w-full rounded-lg border ${hasError ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90 resize-none`;

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Plans" description="Gestion des plans" />
      <PageBreadcrumb pageTitle="Plans" />

      <ComponentCard
        title={editingPlan ? "Modifier le plan" : "Nouveau plan"}
        desc={editingPlan ? `Vous modifiez : ${editingPlan.name}` : "Créez un nouveau plan d'abonnement"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Name + Prices */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
                <input {...register("name")} placeholder="Nom du plan" className={inputCls(!!errors.name)} />
              </div>
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
                <input {...register("price", { valueAsNumber: true })} placeholder="Prix mensuel" type="number" step="0.01" className={inputCls(!!errors.price)} />
              </div>
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div className="space-y-1">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400" />
                <input {...register("annual_price", { valueAsNumber: true })} placeholder="Prix annuel" type="number" step="0.01" className={inputCls(!!errors.annual_price)} />
              </div>
              {errors.annual_price && <p className="text-xs text-red-500">{errors.annual_price.message}</p>}
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <AlignLeft className="size-4 text-gray-500 dark:text-gray-400" />
              Description
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">🇫🇷 Français</label>
                <textarea {...register("description_fr")} rows={2} placeholder="Description en français" className={textareaCls(!!errors.description_fr)} />
                {errors.description_fr && <p className="text-xs text-red-500">{errors.description_fr.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">🇬🇧 English</label>
                <textarea {...register("description_en")} rows={2} placeholder="Description in English" className={textareaCls(!!errors.description_en)} />
                {errors.description_en && <p className="text-xs text-red-500">{errors.description_en.message}</p>}
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BenefitListEditor label="🇫🇷 Avantages — Français" state={benefitsFr} />
            <BenefitListEditor label="🇬🇧 Benefits — English" state={benefitsEn} />
          </div>

          {/* Audio toggle */}
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
              <button type="button" onClick={cancelEdit} className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium text-sm">
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
              {editingPlan ? "Mettre à jour" : "Ajouter le plan"}
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
          <PlansTable plans={plans || []} onRemove={(id) => setDeleteId(id)} onEdit={handleEdit} />
        )}
      </ComponentCard>

      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} className="max-w-[400px]">
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-500 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirmer la suppression</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Êtes-vous sûr de vouloir supprimer ce plan ? Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="animate-spin size-4" /> : "Supprimer"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
