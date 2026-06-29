import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import { useGetPlans } from "../../utils/plan";
import {
  useCreateCheckout,
  useGetMyActiveSubscription
} from "../../utils/subscription";
import { useGetTokenPacks, useBuyTokenPack } from "../../utils/billing";
import { useBilling } from "../../context/BillingContext";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, ArrowLeft, Zap } from "lucide-react";
import { useState } from "react";
import Badge from "../../components/ui/badge/Badge";

export default function SettingsSubscription() {
  const navigate = useNavigate();
  const [billingType, setBillingType] = useState<"monthly" | "annual">("monthly");
  const { data: plans, isLoading: isLoadingPlans, isError: isErrorPlans } = useGetPlans();
  const { data: activeSubscription, isLoading: isLoadingSub } = useGetMyActiveSubscription();
  const { tokenBalance, isPro } = useBilling();
  const { data: tokenPacks = [], isLoading: isLoadingPacks } = useGetTokenPacks();
  const buyPack = useBuyTokenPack();
  const createCheckout = useCreateCheckout();
  // const cancelSubscription = useCancelSubscription();

  const handleChoosePlan = async (planId: string) => {
    try {
      const response = await createCheckout.mutateAsync({
        plan_id: planId,
        billing_type: billingType,
        success_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`,
      });

      localStorage.setItem("pending_transaction_id", response.transaction_id.toString());
      localStorage.setItem("pending_transaction_type", "subscription");
      window.location.href = response.checkout_url;
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  // const handleCancel = async (id: string) => {
  //   if (window.confirm("Êtes-vous sûr de vouloir annuler votre abonnement ?")) {
  //     await cancelSubscription.mutateAsync(id);
  //   }
  // };

  if (isErrorPlans) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-red-500">Erreur lors du chargement des plans.</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Paramètres • Abonnement" description="Gérer votre plan d’abonnement" />
      <PageBreadcrumb pageTitle="Mon Abonnement" />

      <div className="pt-6">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span>Retour aux paramètres</span>
        </button>
      </div>

      <section className="space-y-8 pt-6">
        {/* Current Subscription Status */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] lg:shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Statut de l'abonnement</h2>

          {isLoadingSub ? (
            <div className="mt-4 flex items-center gap-2 text-blue-500">
              <Loader2 className="animate-spin size-5" />
              <span>Chargement du statut...</span>
            </div>
          ) : activeSubscription ? (
            <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600 size-6" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-400">
                      Plan {activeSubscription.plan?.name || "Actif"} — {activeSubscription.plan?.price === 0 ? "Gratuit" : activeSubscription.billing_type === "monthly" ? "Mensuel" : "Annuel"}
                    </h3>
                    {activeSubscription.end_date && <p className="text-sm text-green-700/80 dark:text-green-400/60">
                      Prochaine facturation : {new Date(activeSubscription.end_date).toLocaleDateString()}
                    </p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color="success">Actif</Badge>
                  {/*<Button*/}
                  {/*  variant="outline"*/}
                  {/*  size="sm"*/}
                  {/*  className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"*/}
                  {/*  onClick={() => handleCancel(activeSubscription.id)}*/}
                  {/*  disabled={cancelSubscription.isPending}*/}
                  {/*>*/}
                  {/*  {cancelSubscription.isPending ? <Loader2 className="animate-spin size-4" /> : "Annuler l'abonnement"}*/}
                  {/*</Button>*/}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
              <div className="flex items-center gap-3">
                <XCircle className="text-gray-400 size-6" />
                <p className="text-gray-600 dark:text-gray-400">Aucun abonnement actif pour le moment.</p>
              </div>
            </div>
          )}
        </div>

        {/* Token Balance + Packs (only visible when not Pro) */}
        {!isPro && (
          <div className="p-6 rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] lg:shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Jetons</h2>
                <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
                  Solde actuel :{' '}
                  <span className="font-semibold text-gray-800 dark:text-white">
                    🪙 {tokenBalance} jeton{tokenBalance !== 1 ? 's' : ''}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 dark:bg-amber-900/20 dark:border-amber-800">
                <Zap size={13} className="text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">1 jeton = 1 génération</span>
              </div>
            </div>

            {isLoadingPacks ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin size-6 text-gray-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {tokenPacks.map((pack, i) => (
                  <div
                    key={pack.id}
                    className={`relative rounded-2xl border p-5 flex flex-col gap-3 ${
                      i === 1
                        ? 'border-blue-400 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-900/10'
                        : 'border-gray-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]'
                    }`}
                  >
                    {i === 1 && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap">
                        Recommandé
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{pack.name}</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                        {pack.price_cad} <span className="text-sm font-semibold text-gray-500">$</span>
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🪙 <span className="font-semibold">{pack.tokens} jetons</span>
                    </p>
                    <button
                      onClick={() => buyPack.mutate(pack.id)}
                      disabled={buyPack.isPending}
                      className="mt-auto w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                      {buyPack.isPending ? <Loader2 className="animate-spin size-4 mx-auto" /> : 'Acheter'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Plan Selection */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Changer de plan</h2>
              <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Sélectionnez le forfait qui vous convient le mieux.</p>
            </div>

            {/* Billing Toggle */}
            <div className="inline-flex p-1 bg-gray-100 dark:bg-white/[0.05] rounded-lg">
              <button
                onClick={() => setBillingType("monthly")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${billingType === "monthly"
                  ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingType("annual")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${billingType === "annual"
                  ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Annuel
              </button>
            </div>
          </div>

          {isLoadingPlans ? (
            <div className="flex items-center justify-center p-12 text-blue-500">
              <Loader2 className="animate-spin size-8" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans?.map((p, index) => (
                <div
                  key={p.id}
                  className={`relative p-6 rounded-2xl border transition-all hover:shadow-lg ${activeSubscription?.plan_id === p.id
                    ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/30 dark:bg-blue-900/5"
                    : "border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]"
                    }`}
                >
                  {index === 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white rounded-full">
                        Populaire
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">{p.name}</h3>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                          {billingType === "monthly" ? p.price : p.annual_price} $
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          CAD/{billingType === "monthly" ? "mois" : "an"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-8 flex-1">
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter mb-4">
                        Ce qui est inclus
                      </p>
                      <ul className="space-y-3">
                        {p.benefits_description.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle2 className="size-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8">
                      <Button
                        size="md"
                        className={`w-full rounded-xl font-bold transition-all ${activeSubscription?.plan_id === p.id && (Number(activeSubscription.plan?.price) === 0 || activeSubscription.billing_type === billingType)
                          ? "bg-green-500 hover:bg-green-600 cursor-default"
                          : createCheckout.isPending
                            ? "opacity-70 pointer-events-none"
                            : "hover:scale-[1.02] active:scale-[0.98]"
                          }`}
                        onClick={() => handleChoosePlan(p.id)}
                        disabled={activeSubscription?.plan_id === p.id && (Number(activeSubscription.plan?.price) === 0 || activeSubscription.billing_type === billingType)}
                      >
                        {activeSubscription?.plan?.id === p.id && (Number(activeSubscription.plan?.price) === 0 || activeSubscription.billing_type === billingType) ? (
                          "Plan actuel"
                        ) : createCheckout.isPending ? (
                          <Loader2 className="animate-spin size-5 mx-auto" />
                        ) : (
                          `S'abonner (${p.name})`
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
