import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { useGetPlans } from "../../utils/plan";
import {
  useCreateCheckout,
  useGetMyActiveSubscription,
  useCancelSubscription,
  useChangePlan,
  useUndoCancel,
} from "../../utils/subscription";
import { useGetTokenPacks, useBuyTokenPack } from "../../utils/billing";
import { useBilling } from "../../context/BillingContext";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowLeftRight,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Mic,
  RotateCcw,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function SettingsSubscription() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('app');
  const [billingType, setBillingType] = useState<"monthly" | "annual">("monthly");

  const locale = i18n.language.startsWith('fr') ? 'fr-CA' : 'en-CA';

  const { data: plans, isLoading: isLoadingPlans } = useGetPlans();
  const { data: activeSubscription, isLoading: isLoadingSub } = useGetMyActiveSubscription();
  const { tokenBalance, isPro, isUltra } = useBilling();
  const { data: tokenPacks = [], isLoading: isLoadingPacks } = useGetTokenPacks();

  const buyPack = useBuyTokenPack();
  const createCheckout = useCreateCheckout();
  const changePlan = useChangePlan();
  const cancelSubscription = useCancelSubscription();
  const undoCancel = useUndoCancel();

  const hasSub = !!activeSubscription;
  const isCancelScheduled = activeSubscription?.cancel_at_period_end === true;
  const pendingPlanId = activeSubscription?.pending_plan_id ?? null;
  const pendingPlan = pendingPlanId ? plans?.find(p => p.id === pendingPlanId) : null;
  const endDateFormatted = activeSubscription?.end_date
    ? new Date(activeSubscription.end_date).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })
    : "";

  const handleChoosePlan = async (planId: string) => {
    if (hasSub) {
      // Already subscribed → change-plan endpoint
      await changePlan.mutateAsync({ new_plan_id: planId, billing_type: billingType });
    } else {
      // No subscription → checkout flow
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
    }
  };

  const isMutating = changePlan.isPending || createCheckout.isPending;

  // suppress unused warning — isPro used for future gating
  void isPro;

  return (
    <>
      <PageMeta title={t('settings_subscription.page_title')} description={t('settings_subscription.page_desc')} />
      <PageBreadcrumb pageTitle={t('settings_subscription.title')} />

      <div className="pt-6">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{t('settings_subscription.back')}</span>
        </button>
      </div>

      <section className="space-y-6 pt-6">

        {/* ── Current subscription status ── */}
        <div className="border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03] lg:shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">{t('settings_subscription.status')}</h2>

          {isLoadingSub ? (
            <div className="mt-4 flex items-center gap-2 text-blue-500">
              <Loader2 className="animate-spin size-5" />
              <span className="text-sm">{t('settings_subscription.loading')}</span>
            </div>
          ) : activeSubscription ? (
            <div className="mt-4 space-y-3">
              {/* Active plan badge */}
              <div className={`flex items-center justify-between flex-wrap gap-4 rounded-xl p-4 border ${
                isUltra
                  ? "bg-purple-50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/20"
                  : "bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isUltra ? "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  }`}>
                    {isUltra ? <Banknote size={18} /> : <Sparkles size={18} />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {activeSubscription.billing_type === "monthly"
                        ? t('settings_subscription.plan_monthly', { name: activeSubscription.plan?.name ?? t('settings_subscription.active') })
                        : t('settings_subscription.plan_annual', { name: activeSubscription.plan?.name ?? t('settings_subscription.active') })}
                    </p>
                    {endDateFormatted && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {isCancelScheduled
                          ? t('settings_subscription.access_until', { date: endDateFormatted })
                          : t('settings_subscription.next_renewal', { date: endDateFormatted })}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isCancelScheduled
                    ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                }`}>
                  <CheckCircle2 size={12} className="mr-1" />
                  {isCancelScheduled ? t('settings_subscription.scheduled_cancel') : t('settings_subscription.active')}
                </span>
              </div>

              {/* Pending downgrade banner */}
              {pendingPlan && !isCancelScheduled && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800/40 dark:bg-amber-900/10">
                  <CalendarClock size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-amber-800 dark:text-amber-300"
                     dangerouslySetInnerHTML={{ __html: t('settings_subscription.downgrade_desc', { name: `<strong>${pendingPlan.name}</strong>`, date: endDateFormatted }) }}
                  />
                </div>
              )}

              {/* Cancellation scheduled banner */}
              {isCancelScheduled && (
                <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-900/10">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-300"
                       dangerouslySetInnerHTML={{ __html: t('settings_subscription.cancel_desc', { date: `<strong>${endDateFormatted}</strong>` }) }}
                    />
                  </div>
                  <button
                    onClick={() => undoCancel.mutate(activeSubscription.id)}
                    disabled={undoCancel.isPending}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {undoCancel.isPending ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                    {t('settings_subscription.cancel_downgrade')}
                  </button>
                </div>
              )}

              {/* Cancel button   only when not already scheduled */}
              {!isCancelScheduled && !pendingPlanId && (
                <div className="flex justify-end">
                  <button
                    onClick={() => cancelSubscription.mutate(activeSubscription.id)}
                    disabled={cancelSubscription.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/30 dark:bg-transparent dark:hover:bg-red-900/10"
                  >
                    {cancelSubscription.isPending ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    {t('settings_subscription.cancel_subscription')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <XCircle className="text-gray-400 size-5 shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings_subscription.no_subscription')}</p>
            </div>
          )}
        </div>

        {/* ── Plan selection ── */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {hasSub ? t('settings_subscription.change_plan') : t('settings_subscription.choose_plan')}
              </h2>
              <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                {t('settings_subscription.ultra_superset')}
              </p>
            </div>
            <div className="inline-flex p-1 bg-gray-100 dark:bg-white/[0.05] rounded-lg">
              {(["monthly", "annual"] as const).map(bt => (
                <button
                  key={bt}
                  onClick={() => setBillingType(bt)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    billingType === bt
                      ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {bt === "monthly" ? t('settings_subscription.monthly') : t('settings_subscription.annual')}
                </button>
              ))}
            </div>
          </div>

          {isLoadingPlans ? (
            <div className="flex items-center justify-center p-12 text-blue-500">
              <Loader2 className="animate-spin size-8" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans?.map((p) => {
                const isCurrent = activeSubscription?.plan_id === p.id;
                const isPendingThis = pendingPlanId === p.id;
                const isCurrentBilling = activeSubscription?.billing_type === billingType;
                const isActiveCurrentCombo = isCurrent && isCurrentBilling && !isCancelScheduled;

                let buttonLabel: string;
                let buttonDisabled = false;

                if (isActiveCurrentCombo) {
                  buttonLabel = t('settings_subscription.current_plan');
                  buttonDisabled = true;
                } else if (isMutating) {
                  buttonLabel = "…";
                  buttonDisabled = true;
                } else if (isPendingThis) {
                  buttonLabel = t('settings_subscription.scheduled_for', { date: endDateFormatted });
                  buttonDisabled = true;
                } else if (hasSub) {
                  const currentPrice = Number(activeSubscription?.plan?.price ?? 0);
                  const targetPrice = Number(p.price);
                  buttonLabel = targetPrice > currentPrice
                    ? t('settings_subscription.upgrade_to', { name: p.name })
                    : t('settings_subscription.switch_to', { name: p.name });
                } else {
                  buttonLabel = t('settings_subscription.subscribe', { name: p.name });
                }

                return (
                  <div
                    key={p.id}
                    className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                      isCurrent && !isCancelScheduled
                        ? p.includes_audio
                          ? "border-purple-400 ring-1 ring-purple-400 bg-purple-50/20 dark:bg-purple-900/5"
                          : "border-blue-400 ring-1 ring-blue-400 bg-blue-50/20 dark:bg-blue-900/5"
                        : "border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
                    }`}
                  >
                    {p.includes_audio && (
                      <div className="absolute -top-3 left-6">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-0.5 text-[10px] font-bold text-white">
                          <Mic size={9} />
                          {t('settings_subscription.audio_included')}
                        </span>
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">{p.name}</h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                          {billingType === "monthly" ? p.price : p.annual_price}$
                        </span>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {billingType === "monthly" ? t('settings_subscription.per_month') : t('settings_subscription.per_year')}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{p.description}</p>

                      <ul className="mt-6 space-y-2.5">
                        {p.benefits_description.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-green-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={() => handleChoosePlan(p.id)}
                        disabled={buttonDisabled || isMutating}
                        className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 ${
                          isActiveCurrentCombo
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : isPendingThis
                            ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/10 dark:text-amber-300 dark:border-amber-800"
                            : p.includes_audio
                            ? "bg-purple-600 text-white hover:bg-purple-700 hover:scale-[1.01] active:scale-[0.99]"
                            : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99]"
                        }`}
                      >
                        {isMutating && !buttonDisabled ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : hasSub && !isActiveCurrentCombo && !isPendingThis ? (
                          <ArrowLeftRight size={14} />
                        ) : null}
                        {buttonLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Token balance + packs ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03] lg:shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">{t('settings_subscription.tokens')}</h2>
              <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
                {t('settings_subscription.token_balance')}:{" "}
                <span className="font-semibold text-gray-800 dark:text-white">
                  🪙 {tokenBalance} {t('settings_subscription.tokens')}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 dark:bg-amber-900/20 dark:border-amber-800">
              <Zap size={13} className="text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">{t('settings_subscription.token_desc')}</span>
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
                      ? "border-blue-400 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-900/10"
                      : "border-gray-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]"
                  }`}
                >
                  {i === 1 && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap">
                      {t('settings_subscription.recommended')}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{pack.name}</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                      {pack.price_cad} <span className="text-sm font-semibold text-gray-500">$</span>
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    🪙 <span className="font-semibold">{pack.tokens} {t('upgrade_modal.tokens_unit')}</span>
                  </p>
                  <button
                    onClick={() => buyPack.mutate(pack.id)}
                    disabled={buyPack.isPending}
                    className="mt-auto w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {buyPack.isPending ? <Loader2 className="animate-spin size-4 mx-auto" /> : t('upgrade_modal.buy_btn')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>
    </>
  );
}
