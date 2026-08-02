import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";
import { useTranslation } from "react-i18next";

export default function PaymentCancel() {
    const navigate = useNavigate();
    const { t } = useTranslation('app');

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <PageMeta title={t('payment_cancel.title')} description={t('payment_cancel.desc')} />

            <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-white/[0.05]">
                <div className="mx-auto size-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <XCircle className="size-12 text-orange-600" />
                </div>

                <h1 className="mt-6 text-2xl font-bold text-gray-800 dark:text-white/90">{t('payment_cancel.title')}</h1>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                    {t('payment_cancel.desc')}
                </p>

                <div className="mt-8 flex flex-col gap-3">
                    <Button className="w-full" onClick={() => navigate("/subscription")}>
                        {t('payment_cancel.back_subscription')}
                    </Button>
                    <button
                        onClick={() => navigate("/home")}
                        className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        {t('payment_cancel.back_home')}
                    </button>
                </div>
            </div>
        </div>
    );
}
