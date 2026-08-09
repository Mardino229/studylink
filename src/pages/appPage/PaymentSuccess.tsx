import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";
import { useGetTransactions } from "../../utils/subscription";
import { useGetTokenTransactions } from "../../utils/billing";
import type { Transaction } from "../../utils/type";
import type { TokenTransaction } from "../../utils/type";
import { useTranslation } from "react-i18next";

type TxType = "subscription" | "token_pack";
type PageStatus = "loading" | "success" | "failed" | "timeout";

const MAX_ATTEMPTS = 12;
const POLL_INTERVAL = 2500;

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t } = useTranslation('app');

    const txType = (localStorage.getItem("pending_transaction_type") ?? "subscription") as TxType;
    const pendingTxId = localStorage.getItem("pending_transaction_id");
    const checkoutTime = parseInt(localStorage.getItem("pending_token_checkout_time") ?? "0", 10);

    const [status, setStatus] = useState<PageStatus>("loading");
    const [attempts, setAttempts] = useState(0);
    const [confirmedTx, setConfirmedTx] = useState<{ amount?: number; label?: string } | null>(null);

    // Subscription polling   fetch last 10 transactions
    const { data: subTransactions, refetch: refetchSub } = useGetTransactions(10, 0);

    // Token pack polling   fetch last 10 token transactions
    const { data: tokenTransactions, refetch: refetchToken } = useGetTokenTransactions(0, 10);

    useEffect(() => {
        if (status !== "loading") return;
        if (attempts >= MAX_ATTEMPTS) {
            setStatus("timeout");
            return;
        }

        const poll = async () => {
            if (txType === "subscription") {
                if (!pendingTxId) { setStatus("failed"); return; }
                await refetchSub();
                const tx = subTransactions?.items?.find((tx: Transaction) => tx.id === pendingTxId);
                if (tx?.status === "completed") {
                    setConfirmedTx({ label: tx.plan?.name ?? "Pro", amount: Number(tx.amount) });
                    setStatus("success");
                    localStorage.removeItem("pending_transaction_id");
                    queryClient.invalidateQueries({ queryKey: ["my-active-subscription"] });
                    queryClient.invalidateQueries({ queryKey: ["token-balance"] });
                } else if (tx?.status === "failed") {
                    setStatus("failed");
                } else {
                    setAttempts(p => p + 1);
                }
            } else {
                // token_pack   look for a "purchase" transaction created after checkout
                await refetchToken();
                const toUTCMs = (s: string) =>
                    new Date(/Z$|[+-]\d{2}:\d{2}$/.test(s) ? s : s + 'Z').getTime();
                const tx = (tokenTransactions as TokenTransaction[] | undefined)?.find(
                    tx => tx.type === "purchase" && tx.amount > 0 &&
                         toUTCMs(tx.created_at) > checkoutTime - 5000
                );
                if (tx) {
                    setConfirmedTx({ amount: tx.amount });
                    setStatus("success");
                    localStorage.removeItem("pending_token_checkout_time");
                    queryClient.invalidateQueries({ queryKey: ["token-balance"] });
                } else {
                    setAttempts(p => p + 1);
                }
            }
        };

        const timer = setTimeout(poll, POLL_INTERVAL);
        return () => clearTimeout(timer);
    }, [attempts, status]); // eslint-disable-line react-hooks/exhaustive-deps

    const isSubscription = txType === "subscription";

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <PageMeta
                title={t('payment_success.page_confirming')}
                description={isSubscription ? t('payment_success.page_sub_confirming') : t('payment_success.page_credits_confirming')}
            />

            <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-white/[0.03]  dark:border-white/[0.05]">

                {/* Loading */}
                {status === "loading" && (
                    <div className="space-y-6">
                        <div className="mx-auto size-20 flex items-center justify-center">
                            <Loader2 className="size-16 text-blue-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                            {t('payment_success.loading')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {isSubscription ? t('payment_success.sub_loading') : t('payment_success.credits_loading')}
                        </p>
                        <p className="text-xs text-gray-400">
                            {t('payment_success.attempt', { current: attempts + 1, total: MAX_ATTEMPTS })}
                        </p>
                    </div>
                )}

                {/* Success */}
                {status === "success" && (
                    <div className="space-y-6">
                        <div className="mx-auto size-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <CheckCircle2 className="size-12 text-green-600" />
                        </div>

                        {isSubscription ? (
                            <>
                                <div className="flex items-center justify-center gap-2">
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                        {t('payment_success.sub_success_title', { name: confirmedTx?.label ?? "Pro" })}
                                    </h1>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t('payment_success.sub_success_desc')}
                                </p>
                                <Button className="w-full" onClick={() => navigate("/subscription")}>
                                    {t('payment_success.view_subscription')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-center gap-2">
                                    <Zap size={20} className="text-amber-500" />
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                        {t('payment_success.credits_success_title', { count: confirmedTx?.amount ?? "?" })}
                                    </h1>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t('payment_success.credits_success_desc')}
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Button className="w-full" onClick={() => navigate("/workspaces")}>
                                        {t('payment_success.start_creating')}
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={() => navigate("/subscription")}>
                                        {t('payment_success.view_wallet')}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Failed / Timeout */}
                {(status === "failed" || status === "timeout") && (
                    <div className="space-y-6">
                        <div className="mx-auto size-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertCircle className="size-12 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                            {status === "timeout" ? t('payment_success.delayed_title') : t('payment_success.error_title')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {status === "timeout"
                                ? isSubscription
                                    ? t('payment_success.delayed_desc')
                                    : t('payment_success.credits_delayed_desc')
                                : t('payment_success.failed_desc')}
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                className="w-full"
                                onClick={() => navigate("/subscription")}
                            >
                                {isSubscription ? t('payment_success.view_subscriptions') : t('payment_success.view_wallet')}
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => {
                                setStatus("loading");
                                setAttempts(0);
                            }}>
                                {t('payment_success.retry')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
