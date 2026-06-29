import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    BookMarked, BookOpen, Bot, CreditCard,
    FileText, Layers, MessageSquare, Settings,
    Sparkles, Zap, HelpCircle, TrendingUp,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { useUser } from "../../components/layout/userContext.tsx";
import { useBilling } from "../../context/BillingContext";
import { useGetTokenStats } from "../../utils/billing";
import { useGetNotebooks } from "../../utils/workspace";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};

export default function Home() {
    const { user } = useUser();
    const { isPro, tokenBalance, subscription } = useBilling();
    const { data: tokenStats } = useGetTokenStats();
    const { data: notebooks } = useGetNotebooks(undefined, { perPage: 1 });

    const notebookCount = notebooks?.total ?? 0;
    const artefactCount = tokenStats?.consumption?.artefact?.count ?? 0;
    const chatCount = tokenStats?.consumption?.chat?.count ?? 0;
    const tokenSpent = tokenStats?.totalTokensSpent ?? 0;
    const tokenPurchased = tokenStats?.totalTokensPurchased ?? 0;

    const hourOfDay = new Date().getHours();
    const greeting =
        hourOfDay < 12 ? "Bonjour" : hourOfDay < 18 ? "Bon après-midi" : "Bonsoir";
    const firstName = user?.first_name ?? "étudiant";

    const KPI_CARDS = [
        {
            label: isPro ? "Abonnement Pro" : `${tokenBalance} jeton${tokenBalance !== 1 ? "s" : ""}`,
            sub: isPro
                ? subscription?.end_date
                    ? `Actif jusqu'au ${new Date(subscription.end_date).toLocaleDateString("fr-CA")}`
                    : "Accès illimité"
                : tokenBalance === 0 ? "Solde vide" : "Disponibles",
            icon: isPro ? Sparkles : Zap,
            color: isPro
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : tokenBalance > 0
                ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
            href: "/settings/subscription",
        },
        {
            label: `${notebookCount} notebook${notebookCount !== 1 ? "s" : ""}`,
            sub: "Workspaces actifs",
            icon: BookOpen,
            color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
            href: "/workspaces",
        },
        {
            label: `${artefactCount} artefact${artefactCount !== 1 ? "s" : ""}`,
            sub: "Résumés, flashcards & quiz",
            icon: Layers,
            color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
            href: "/workspaces",
        },
        {
            label: `${chatCount * 10}+ messages`,
            sub: "Échanges avec le chat IA",
            icon: MessageSquare,
            color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
            href: "/workspaces",
        },
    ];

    const QUICK_ACTIONS = [
        { label: "Nouveau notebook", desc: "Créez un espace de travail", icon: BookOpen, href: "/workspaces", color: "from-blue-500 to-blue-600" },
        { label: "Bibliothèque d'épreuves", desc: "Examens & corrigés", icon: BookMarked, href: "/exam-library", color: "from-emerald-500 to-emerald-600" },
        { label: "Chat IA", desc: "Posez vos questions", icon: Bot, href: "/workspaces", color: "from-purple-500 to-purple-600" },
        { label: "Mon abonnement", desc: "Jetons & plans", icon: CreditCard, href: "/settings/subscription", color: "from-amber-500 to-amber-600" },
    ];

    const consumptions = [
        { label: "Résumés / Flashcards / Quiz", icon: FileText, count: tokenStats?.consumption?.artefact?.tokensSpent ?? 0, color: "bg-blue-500" },
        { label: "Corrigés d'examens", icon: HelpCircle, count: tokenStats?.consumption?.corrige?.tokensSpent ?? 0, color: "bg-emerald-500" },
        { label: "Chat IA (tranches 10 msgs)", icon: MessageSquare, count: tokenStats?.consumption?.chat?.tokensSpent ?? 0, color: "bg-purple-500" },
    ];
    const totalConsumed = consumptions.reduce((s, c) => s + c.count, 0) || 1;

    return (
        <>
            <PageMeta title="Dashboard" description="Tableau de bord StudyLink" />
            <PageBreadcrumb pageTitle="Dashboard" />

            <div className="space-y-6 pb-6">

                {/* ── Hero greeting ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 p-6 sm:p-8 dark:border-blue-900/30"
                >
                    <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-8 left-8 h-32 w-32 rounded-full bg-purple-300/20 blur-2xl" />
                    <div className="relative">
                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">
                            {greeting}
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">
                            {firstName} 👋
                        </h1>
                        {user?.program?.name && (
                            <p className="mt-2 text-sm text-blue-100 opacity-80">
                                {user.program.name}
                                {user.faculty?.name && ` · ${user.faculty.name}`}
                            </p>
                        )}
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                to="/workspaces"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow hover:opacity-90 transition-opacity"
                            >
                                <BookOpen size={15} />
                                Mes notebooks
                            </Link>
                            <Link
                                to="/exam-library"
                                className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                            >
                                <BookMarked size={15} />
                                Épreuves
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* ── KPI cards ── */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 gap-4 lg:grid-cols-4"
                >
                    {KPI_CARDS.map(({ label, sub, icon: Icon, color, href }) => (
                        <motion.div key={label} variants={fadeUp}>
                            <Link
                                to={href}
                                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900/80"
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-gray-900 dark:text-white leading-snug">{label}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── Quick actions + Token consumption ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* Quick actions */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                            Actions rapides
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {QUICK_ACTIONS.map(({ label, desc, icon: Icon, href, color }) => (
                                <motion.div key={label} variants={fadeUp}>
                                    <Link
                                        to={href}
                                        className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-900/80"
                                    >
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}>
                                            <Icon size={17} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Token consumption */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.2 }}
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/80"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500">
                                Consommation de jetons
                            </h2>
                            <TrendingUp size={16} className="text-gray-400" />
                        </div>

                        {/* Summary line */}
                        <div className="mb-5 flex items-end gap-2">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{tokenSpent}</span>
                            <span className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                jetons utilisés
                                {tokenPurchased > 0 && ` sur ${tokenPurchased} achetés`}
                            </span>
                        </div>

                        {/* Breakdown bars */}
                        <div className="space-y-4">
                            {consumptions.map(({ label, icon: Icon, count, color }) => {
                                const pct = Math.round((count / totalConsumed) * 100);
                                return (
                                    <div key={label}>
                                        <div className="mb-1.5 flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                <Icon size={12} />
                                                {label}
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {count} 🪙
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${pct}%` }}
                                                transition={{ duration: 0.7, ease: "easeOut" }}
                                                viewport={{ once: true }}
                                                className={`h-full rounded-full ${color}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {tokenSpent === 0 && (
                            <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-600">
                                Aucune consommation pour l'instant. Générez votre premier artefact !
                            </p>
                        )}

                        <Link
                            to="/settings/subscription"
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
                        >
                            <Settings size={13} />
                            Gérer mon abonnement
                        </Link>
                    </motion.div>
                </div>

                {/* ── Study tips / links ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                >
                    {[
                        {
                            icon: Layers,
                            color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10",
                            title: "Flashcards",
                            body: "Transformez vos notes en flashcards question-réponse pour mémoriser plus vite.",
                            href: "/workspaces",
                        },
                        {
                            icon: HelpCircle,
                            color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
                            title: "Quiz IA",
                            body: "Testez vos connaissances avant un examen avec des questions générées par l'IA.",
                            href: "/workspaces",
                        },
                        {
                            icon: BookMarked,
                            color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
                            title: "Épreuves passées",
                            body: "Entraînez-vous sur les vraies épreuves de l'uOttawa avec corrigés.",
                            href: "/exam-library",
                        },
                    ].map(({ icon: Icon, color, title, body, href }) => (
                        <Link
                            key={title}
                            to={href}
                            className="group flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900/80"
                        >
                            <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
                                <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{body}</p>
                            </div>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </>
    );
}
