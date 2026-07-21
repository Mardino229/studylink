import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bug, Lightbulb, HelpCircle, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { useSubmitSupportTicket, type TicketType } from "../../utils/support";

const TICKET_TYPES: { value: TicketType; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
        value: 'report_issue',
        label: "Signaler un bug",
        desc: "Quelque chose ne fonctionne pas correctement",
        icon: <Bug size={18} />,
        color: "text-red-500 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-800/40",
    },
    {
        value: 'feature_request',
        label: "Suggérer une fonctionnalité",
        desc: "Proposez une amélioration ou une nouvelle idée",
        icon: <Lightbulb size={18} />,
        color: "text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-800/40",
    },
    {
        value: 'get_help',
        label: "Obtenir de l'aide",
        desc: "Une question ou un blocage à résoudre",
        icon: <HelpCircle size={18} />,
        color: "text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-800/40",
    },
    {
        value: 'feedback',
        label: "Laisser un avis",
        desc: "Partagez votre expérience générale",
        icon: <MessageSquare size={18} />,
        color: "text-brand-500 bg-brand-50 border-brand-200 dark:bg-brand-500/10 dark:border-brand-800/40",
    },
];

export default function SettingsFeedback() {
    const navigate = useNavigate();
    const { mutateAsync, isPending } = useSubmitSupportTicket();

    const [selectedType, setSelectedType] = useState<TicketType>('feedback');
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!message.trim()) return;
        await mutateAsync({ type: selectedType, message: message.trim() });
        setSubmitted(true);
        setMessage("");
    }

    if (submitted) {
        return (
            <>
                <PageMeta title="Support & Feedback" description="Votre message a été envoyé" />
                <PageBreadcrumb pageTitle="Support & Feedback" />
                <div className="mt-16 flex flex-col items-center gap-4 text-center max-w-md mx-auto">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Message envoyé !</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Notre équipe prendra en compte votre retour. Merci de contribuer à l'amélioration de GoStudyEasy.
                    </p>
                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={() => setSubmitted(false)}
                            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Envoyer un autre message
                        </button>
                        <button
                            onClick={() => navigate("/settings")}
                            className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
                        >
                            Retour aux paramètres
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <PageMeta title="Support & Feedback" description="Contactez-nous ou partagez votre avis" />
            <PageBreadcrumb pageTitle="Support & Feedback" />

            <div className="pt-6">
                <button
                    onClick={() => navigate("/settings")}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Retour aux paramètres
                </button>
            </div>

            <div className="mt-6 max-w-2xl mx-auto space-y-6">
                {/* Type picker */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/80">
                    <h2 className="mb-4 text-sm font-semibold text-gray-400 dark:text-gray-500">
                        Type de demande
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TICKET_TYPES.map(({ value, label, desc, icon, color }) => {
                            const isSelected = selectedType === value;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setSelectedType(value)}
                                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                                        isSelected
                                            ? `${color} ring-1 ring-inset ring-current/20`
                                            : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                                    }`}
                                >
                                    <span className={`mt-0.5 shrink-0 ${isSelected ? '' : 'text-gray-400 dark:text-gray-600'}`}>
                                        {icon}
                                    </span>
                                    <div>
                                        <p className={`text-sm font-semibold ${isSelected ? '' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {label}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${isSelected ? 'opacity-80' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {desc}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Message form */}
                <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/80 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 ">
                        Votre message
                    </h2>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        placeholder="Décrivez votre demande en détail…"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:focus:border-brand-700 resize-none transition-colors"
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending || !message.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending && <Loader2 size={15} className="animate-spin" />}
                            Envoyer
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
