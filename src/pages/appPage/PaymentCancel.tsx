import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";

export default function PaymentCancel() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <PageMeta title="Paiement Annulé" description="Le paiement a été annulé" />

            <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-white/[0.05]">
                <div className="mx-auto size-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <XCircle className="size-12 text-orange-600" />
                </div>

                <h1 className="mt-6 text-2xl font-bold text-gray-800 dark:text-white/90">Paiement Annulé</h1>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                    Votre paiement a été interrompu et aucun frais n'a été prélevé sur votre compte.
                    Vous pouvez réessayer quand vous le souhaitez.
                </p>

                <div className="mt-8 flex flex-col gap-3">
                    <Button className="w-full" onClick={() => navigate("/settings/subscription")}>
                        Retour aux abonnements
                    </Button>
                    <button
                        onClick={() => navigate("/home")}
                        className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    );
}
