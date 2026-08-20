import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { useGetTokenPacks, useBuyTokenPack } from "../../utils/billing";
import { useBilling } from "../../context/BillingContext";
import { useNavigate } from "react-router-dom";
import { Loader2, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

export default function SettingsTokens() {
  const navigate = useNavigate();
  const { t } = useTranslation('app');

  const { tokenBalance } = useBilling();
  const { data: tokenPacks = [], isLoading: isLoadingPacks } = useGetTokenPacks();
  const buyPack = useBuyTokenPack();

  return (
    <>
      <PageMeta title={t('settings_tokens.page_title')} description={t('settings_tokens.page_desc')} />
      <PageBreadcrumb pageTitle={t('settings_tokens.title')} />

      <div className="pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{t('settings_tokens.back')}</span>
        </button>
      </div>

      <section className="space-y-6 pt-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03] lg:shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">{t('settings_tokens.balance_title')}</h2>
              <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
                {t('settings_tokens.balance_label')}:{" "}
                <span className="font-semibold text-gray-800 dark:text-white">
                  🪙 {tokenBalance} {t('settings_tokens.tokens_unit')}
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
