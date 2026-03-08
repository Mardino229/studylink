import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";
import { useGetTransactions } from "../../utils/subscription";
import type { Transaction } from "../../utils/type";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "failed" | "timeout">("loading");
    const [attempts, setAttempts] = useState(0);
    const MAX_ATTEMPTS = 10;
    const POLL_INTERVAL = 2000;

    const pendingTxId = localStorage.getItem("pending_transaction_id");
    const { data: transactions, refetch } = useGetTransactions(5);

    useEffect(() => {
        if (!pendingTxId) {
            setStatus("failed");
            return;
        }

        const poll = async () => {
            if (attempts >= MAX_ATTEMPTS) {
                setStatus("timeout");
                return;
            }

            await refetch();
            const txId = parseInt(pendingTxId);
            const tx = transactions?.items.find((t: Transaction) => t.id === txId);

            if (tx?.status === "completed") {
                setStatus("success");
                localStorage.removeItem("pending_transaction_id");
            } else if (tx?.status === "failed") {
                setStatus("failed");
            } else {
                setAttempts((prev) => prev + 1);
            }
        };

        if (status === "loading") {
            const timer = setTimeout(poll, POLL_INTERVAL);
            return () => clearTimeout(timer);
        }
    }, [attempts, pendingTxId, transactions, refetch, status]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <PageMeta title="Paiement Réussi" description="Confirmation de votre abonnement" />

            <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] shadow-xl">
                {status === "loading" && (
                    <div className="space-y-6">
                        <div className="relative mx-auto size-20 flex items-center justify-center">
                            <Loader2 className="size-16 text-blue-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Confirmation en cours...</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Nous finalisons votre abonnement. Cela ne devrait prendre que quelques secondes.
                        </p>
                        <p className="text-xs text-gray-400">Tentative {attempts + 1} sur {MAX_ATTEMPTS}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-6">
                        <div className="mx-auto size-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <CheckCircle2 className="size-12 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Paiement Réussi !</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Votre abonnement est désormais actif. Vous avez maintenant accès à toutes les fonctionnalités de votre plan.
                        </p>
                        <Button className="w-full" onClick={() => navigate("/settings/subscription")}>
                            Accéder à mes paramètres
                        </Button>
                    </div>
                )}

                {(status === "failed" || status === "timeout") && (
                    <div className="space-y-6">
                        <div className="mx-auto size-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertCircle className="size-12 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                            {status === "timeout" ? "Activation différée" : "Une erreur est survenue"}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {status === "timeout"
                                ? "L'activation prend plus de temps que prévu. Votre abonnement sera actif d'ici quelques minutes."
                                : "Nous n'avons pas pu confirmer votre paiement. Si vous avez été débité, veuillez contacter le support."}
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button className="w-full" onClick={() => navigate("/settings/subscription")}>
                                Retour aux abonnements
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                                Réessayer la vérification
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
