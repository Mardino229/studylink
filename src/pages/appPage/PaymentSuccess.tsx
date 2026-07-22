import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle, Sparkles, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";
import { useGetTransactions } from "../../utils/subscription";
import { useGetTokenTransactions } from "../../utils/billing";
import type { Transaction } from "../../utils/type";
import type { TokenTransaction } from "../../utils/type";

type TxType = "subscription" | "token_pack";
type PageStatus = "loading" | "success" | "failed" | "timeout";

const MAX_ATTEMPTS = 12;
const POLL_INTERVAL = 2500;

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

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
                const tx = subTransactions?.items?.find((t: Transaction) => t.id === pendingTxId);
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
                const tx = (tokenTransactions as TokenTransaction[] | undefined)?.find(
                    t => t.type === "purchase" && t.amount > 0 &&
                         new Date(t.created_at).getTime() > checkoutTime - 5000
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
                title="Paiement confirmé"
                description={isSubscription ? "Confirmation de votre abonnement" : "Confirmation de votre achat de jetons"}
            />

            <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-white/[0.03]  dark:border-white/[0.05]">

                {/* Loading */}
                {status === "loading" && (
                    <div className="space-y-6">
                        <div className="mx-auto size-20 flex items-center justify-center">
                            <Loader2 className="size-16 text-blue-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                            Confirmation en cours…
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {isSubscription
                                ? "Nous finalisons votre abonnement. Cela ne devrait prendre que quelques secondes."
                                : "Nous créditons vos jetons. Cela ne devrait prendre que quelques secondes."}
                        </p>
                        <p className="text-xs text-gray-400">
                            Tentative {attempts + 1} sur {MAX_ATTEMPTS}
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
                                        Abonnement {confirmedTx?.label ?? "Pro"} activé !
                                    </h1>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Votre abonnement est désormais actif. Vous avez accès illimité à toutes les fonctionnalités sans jamais consommer de jetons.
                                </p>
                                <Button className="w-full" onClick={() => navigate("/subscription")}>
                                    Voir mon abonnement
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-center gap-2">
                                    <Zap size={20} className="text-amber-500" />
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                        {confirmedTx?.amount ?? "?"} jetons crédités !
                                    </h1>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Vos jetons ont été ajoutés à votre solde. Chaque génération (résumé, flashcards, quiz) consomme 1 jeton.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Button className="w-full" onClick={() => navigate("/workspaces")}>
                                        Commencer à créer vous outils de révision
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={() => navigate("/subscription")}>
                                        Voir mon solde
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
                            {status === "timeout" ? "Traitement différé" : "Une erreur est survenue"}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {status === "timeout"
                                ? isSubscription
                                    ? "L'activation de votre abonnement prend plus de temps que prévu. Vous serez actif d'ici quelques minutes   rafraîchissez la page paramètres."
                                    : "Le crédit de vos jetons prend plus de temps que prévu. Votre solde sera mis à jour d'ici quelques minutes."
                                : "Nous n'avons pas pu confirmer votre paiement. Si vous avez été débité, contactez le support."}
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                className="w-full"
                                onClick={() => navigate(isSubscription ? "/subscription" : "/subscription")}
                            >
                                {isSubscription ? "Voir mes abonnements" : "Voir mon solde"}
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => {
                                setStatus("loading");
                                setAttempts(0);
                            }}>
                                Réessayer la vérification
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
