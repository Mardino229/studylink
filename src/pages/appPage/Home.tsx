import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    BookMarked, BookOpen, Bot, ArrowRight, ChevronRight, CreditCard,
    FileText, Layers, MessageSquare, Mic, Settings,
    Sparkles, Zap, HelpCircle, TrendingUp,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { useUser } from "../../components/layout/userContext.tsx";
import { useBilling } from "../../context/BillingContext";
import { useGetTokenStats } from "../../utils/billing";
import { useGetNotebooks } from "../../utils/workspace";
import { useTranslation } from "react-i18next";

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};

export default function Home() {
    const { user } = useUser();
    const { isPro, isUltra, tokenBalance, subscription } = useBilling();
    const { data: tokenStats } = useGetTokenStats();
    const { data: notebooks } = useGetNotebooks(undefined, { perPage: 1 });
    const { t, i18n } = useTranslation('app');

    const notebookCount = notebooks?.pagination.total ?? 0;
    const artefactCount = tokenStats?.consumption?.artefact?.count ?? 0;
    const chatCount = tokenStats?.consumption?.chat?.count ?? 0;
    const tokenSpent = tokenStats?.totalTokensSpent ?? 0;
    const tokenPurchased = tokenStats?.totalTokensPurchased ?? 0;

    const hourOfDay = new Date().getHours();
    const greeting =
        hourOfDay < 12 ? t('home.greeting_morning') : hourOfDay < 18 ? t('home.greeting_afternoon') : t('home.greeting_evening');
    const firstName = user?.first_name ?? t('home.user_fallback');

    const locale = i18n.language.startsWith('fr') ? 'fr-CA' : 'en-CA';

    const KPI_CARDS = [
        {
            value: isUltra ? "Ultra" : isPro ? "Pro" : String(tokenBalance),
            label: isUltra ? t('home.plan_ultra') : isPro ? t('home.plan_pro') : t('home.tokens_label'),
            sub: isPro
                ? subscription?.end_date
                    ? t('home.access_until', { date: new Date(subscription.end_date).toLocaleDateString(locale) })
                    : t('home.unlimited')
                : tokenBalance === 0 ? t('home.balance_empty') : t('home.of_purchased', { total: tokenPurchased }),
            icon: isPro ? Sparkles : Zap,
            color: isUltra
                ? "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                : isPro
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : tokenBalance > 0
                ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
            href: "/subscription",
        },
        {
            value: String(notebookCount),
            label: t('home.stat_notebooks'),
            sub: t('home.stat_workspaces'),
            icon: BookOpen,
            color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
            href: "/workspaces",
        },
        {
            value: String(artefactCount),
            label: t('home.stat_tools'),
            sub: t('home.stat_tools_desc'),
            icon: Layers,
            color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
            href: "/workspaces",
        },
    ];

    const QUICK_ACTIONS = [
        { label: t('home.action_new_notebook'), desc: t('home.action_create_workspace'), icon: BookOpen, href: "/workspaces", color: "from-blue-500 to-blue-600" },
        { label: t('home.action_exam_library'), desc: t('home.action_exams_desc'), icon: BookMarked, href: "/exam-library", color: "from-emerald-500 to-emerald-600" },
        { label: t('home.action_chat'), desc: t('home.action_chat_desc'), icon: Bot, href: "/workspaces", color: "from-purple-500 to-purple-600" },
        { label: t('home.action_subscription'), desc: t('home.action_subscription_desc'), icon: CreditCard, href: "/subscription", color: "from-amber-500 to-amber-600" },
    ];

    const consumptions = [
        { label: t('home.usage_summaries'), icon: FileText, count: tokenStats?.consumption?.artefact?.tokensSpent ?? 0, color: "bg-blue-500" },
        { label: t('home.usage_solutions'), icon: HelpCircle, count: tokenStats?.consumption?.corrige?.tokensSpent ?? 0, color: "bg-emerald-500" },
        { label: t('home.usage_chat'), icon: MessageSquare, count: tokenStats?.consumption?.chat?.tokensSpent ?? 0, color: "bg-purple-500" },
        { label: t('home.usage_audio'), icon: Mic, count: tokenStats?.consumption?.audio?.tokensSpent ?? 0, color: "bg-amber-500" },
    ];
    const totalConsumed = consumptions.reduce((s, c) => s + c.count, 0) || 1;

    const STUDY_TIPS = [
        {
            icon: Layers,
            color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10",
            title: t('home.tip_flashcards_title'),
            body: t('home.tip_flashcards_body'),
            href: "/workspaces",
        },
        {
            icon: HelpCircle,
            color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
            title: t('home.tip_quiz_title'),
            body: t('home.tip_quiz_body'),
            href: "/workspaces",
        },
        {
            icon: BookMarked,
            color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
            title: t('home.tip_exams_title'),
            body: t('home.tip_exams_body'),
            href: "/exam-library",
        },
    ];

    return (
        <>
            <PageMeta title={t('home.dashboard_title')} description={t('home.dashboard_title')} />
            <PageBreadcrumb pageTitle="Dashboard" />

            <div className="space-y-6 pb-6">

                {/* ── Hero greeting ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 dark:border-blue-900/30 dark:from-blue-900/20 dark:to-indigo-900/10"
                >
                    <svg
                        className="pointer-events-none absolute inset-0 h-full w-full rounded-2xl"
                        style={{ mixBlendMode: 'multiply', opacity: 0.38 } as React.CSSProperties}
                        aria-hidden="true"
                    >
                        <filter id="hero-grain">
                            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
                            <feColorMatrix type="saturate" values="0" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#hero-grain)" />
                    </svg>
                    <div className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-blue-200/40 blur-2xl dark:bg-blue-500/10" />
                    <div className="pointer-events-none absolute -bottom-8 left-8 h-24 w-24 rounded-full bg-indigo-200/40 blur-2xl dark:bg-indigo-500/10" />
                    <div className="relative">
                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-1">
                            {greeting}
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
                            {firstName} 👋
                        </h1>
                        {user?.program?.name && (
                            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 opacity-80">
                                {user.program.name}
                                {user.faculty?.name && ` · ${user.faculty.name}`}
                            </p>
                        )}
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                to="/workspaces"
                                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                            >
                                <BookOpen size={15} />
                                {t('home.my_notebooks')}
                            </Link>
                            <Link
                                to="/exam-library"
                                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-white transition-colors dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                            >
                                <BookMarked size={15} />
                                {t('home.exams_btn')}
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* ── KPI cards ── */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 gap-4 lg:grid-cols-3"
                >
                    {KPI_CARDS.map(({ value, label, sub, icon: Icon, color, href }) => (
                        <motion.div key={label}>
                            <Link
                                to={href}
                                className="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/80"
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                                        <Icon size={19} />
                                    </div>
                                    <ChevronRight size={13} className="mt-0.5 text-gray-300 transition-colors group-hover:text-gray-500 dark:text-gray-700 dark:group-hover:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black leading-tight text-gray-900 dark:text-white">{value}</p>
                                    <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{sub}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── Quick actions + Token consumption ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* Quick actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.2 }}
                        className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/80"
                    >
                        <h2 className="mb-4 text-sm font-semibold text-gray-400 dark:text-gray-500">
                            {t('home.quick_actions')}
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {QUICK_ACTIONS.map(({ label, desc, icon: Icon, href, color }) => (
                                <Link
                                    key={label}
                                    to={href}
                                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white`}>
                                            <Icon size={15} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="size-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Token consumption */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.2 }}
                        className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/80"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500">
                                {t('home.token_usage')}
                            </h2>
                            <TrendingUp size={16} className="text-gray-400" />
                        </div>

                        <div className="mb-5 flex items-end gap-2">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{tokenSpent}</span>
                            <span className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                {t('home.tokens_used')}
                                {tokenPurchased > 0 && ` ${t('home.of_purchased', { total: tokenPurchased })}`}
                            </span>
                        </div>

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
                                {t('home.no_consumption')}
                            </p>
                        )}

                        <Link
                            to="/subscription"
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
                        >
                            <Settings size={13} />
                            {t('home.manage_subscription')}
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
                    {STUDY_TIPS.map(({ icon: Icon, color, title, body, href }) => (
                        <Link
                            key={title}
                            to={href}
                            className="group flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900/80"
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
