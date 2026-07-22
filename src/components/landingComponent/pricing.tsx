import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, Mic, Sparkles, Zap } from "lucide-react";
import { useGetPlans } from "../../utils/plan";
import { useGetPublicTokenPacks } from "../../utils/billing";

const TIER_FEATURES = [
    { label: "Accéder à ses outils de révision",   free: true,  tokens: true,    pro: true,  ultra: true  },
    { label: "Sources YouTube (vidéos publiques)", free: true,  tokens: true,    pro: true,  ultra: true  },
    { label: "Épreuves",                           free: false, tokens: "1 🪙",  pro: true,  ultra: true  },
    { label: "Créer résumés / flashcards / quiz", free: false, tokens: "1 🪙", pro: true,  ultra: true  },
    { label: "Chat (tranche 10 msgs)",             free: false, tokens: "1 🪙",  pro: true,  ultra: true  },
    { label: "Corrigés d'examens",                 free: false, tokens: "2 🪙",  pro: true,  ultra: true  },
    { label: "Résumés audio",                      free: false, tokens: "2 🪙",  pro: false, ultra: true  },
    { label: "Podcasts",          free: false, tokens: "2 🪙",  pro: false, ultra: true  },
];

function Check() {
    return <CheckCircle2 size={16} className="text-green-500 shrink-0" />;
}
function Cross() {
    return <span className="text-gray-300 dark:text-gray-700 text-lg font-bold select-none"> </span>;
}

export default function Pricing() {
    const [billingType, setBillingType] = useState<"monthly" | "annual">("monthly");
    const { data: plans = [], isLoading: isLoadingPlans } = useGetPlans();
    const { data: packs = [], isLoading: isLoadingPacks } = useGetPublicTokenPacks();

    const proPlans = plans ?? null;

    return (
        <section className="py-12 sm:py-28 bg-background" id="pricing">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
                    >
                        Des tarifs clairs, sans surprise
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.06 }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="mt-4 text-lg text-foreground/70"
                    >
                        Gratuit, jetons à la demande, Pro illimité   ou Ultra pour débloquer les podcasts et résumés audio.
                    </motion.p>
                </div>

                {/* ── Tier comparison ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="mt-14 overflow-x-auto rounded-2xl border border-border"
                >
                    <table className="w-full min-w-[620px] text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="px-6 py-4 text-left font-medium text-foreground/50 w-2/5">Fonctionnalité</th>
                                <th className="px-4 py-4 text-center font-semibold text-foreground/70">Gratuit</th>
                                <th className="px-4 py-4 text-center font-semibold text-amber-600 dark:text-amber-400">
                                    <span className="inline-flex items-center gap-1"><Zap size={14} /> Jetons</span>
                                </th>
                                <th className="px-4 py-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                                    <span className="inline-flex items-center gap-1"><Sparkles size={14} /> Pro</span>
                                </th>
                                <th className="px-4 py-4 text-center font-semibold text-violet-600 dark:text-violet-400">
                                    <span className="inline-flex items-center gap-1"><Mic size={14} /> Ultra</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {TIER_FEATURES.map(({ label, free, tokens, pro, ultra }) => (
                                <tr key={label} className="hover:bg-muted/40 transition-colors">
                                    <td className="px-6 py-3.5 text-foreground/80">{label}</td>
                                    <td className="px-4 py-3.5 text-center">
                                        {free ? <div className="flex justify-center"><Check /></div> : <div className="flex justify-center"><Cross /></div>}
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        {tokens === true ? (
                                            <div className="flex justify-center"><Check /></div>
                                        ) : typeof tokens === "string" ? (
                                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                {tokens}
                                            </span>
                                        ) : (
                                            <div className="flex justify-center"><Cross /></div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        {pro ? <div className="flex justify-center"><Check /></div> : <div className="flex justify-center"><Cross /></div>}
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        {ultra ? <div className="flex justify-center"><Check /></div> : <div className="flex justify-center"><Cross /></div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

                {/* ── Token packs ── */}
                <div className="mt-20">
                    <div className="text-center mb-10">
                        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">Packs de jetons</p>
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground">Payez uniquement ce que vous utilisez</h3>
                        <p className="mt-3 text-foreground/60 max-w-xl mx-auto">
                            Chaque jeton = 1 génération (résumé, flashcards, quiz…). Épreuves : 1 jeton · Corrigés : 2 jetons. Aucune date d'expiration.
                        </p>
                    </div>

                    {isLoadingPacks ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin size-8 text-amber-500" />
                        </div>
                    ) : (
                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
                        >
                            {packs.map((pack, i) => (
                                <motion.div
                                    key={pack.id}
                                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
                                    className={`relative flex flex-col rounded-2xl border p-6 ${
                                        i === 1
                                            ? "border-amber-400 bg-amber-50 shadow-lg shadow-amber-100/60 dark:bg-amber-950/10 dark:border-amber-700 dark:shadow-none"
                                            : "border-border bg-card"
                                    }`}
                                >
                                    {i === 1 && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white whitespace-nowrap">
                                            Meilleur rapport
                                        </span>
                                    )}
                                    <p className="text-lg font-bold text-foreground">{pack.name}</p>
                                    <div className="mt-3 flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-foreground">{pack.price_cad}</span>
                                        <span className="text-foreground/50 font-medium">$ CAD</span>
                                    </div>
                                    <p className="mt-2 text-sm text-foreground/60">
                                        🪙 <strong>{pack.tokens} jetons</strong>
                                        <span className="ml-1 text-foreground/40">
                                            ({(Number(pack.price_cad) / pack.tokens).toFixed(2)} $/jeton)
                                        </span>
                                    </p>
                                    <Link
                                        to="/register"
                                        className={`mt-6 flex items-center justify-center rounded-full h-11 px-6 text-sm font-bold transition-colors ${
                                            i === 1
                                                ? "bg-amber-500 text-white hover:bg-amber-600"
                                                : "bg-foreground/10 text-foreground hover:bg-foreground/15"
                                        }`}
                                    >
                                        Acheter
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* ── Subscriptions ── */}
                <div className="mt-20">
                    <div className="text-center mb-10">
                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Abonnements</p>
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground">Tout illimité, sans compter les jetons</h3>
                        <p className="mt-3 text-foreground/60 max-w-xl mx-auto">
                            Pro pour un accès illimité à tous vos outils de révision et corrigés. Ultra pour tout ça, plus les podcasts et résumés audio inclus.
                        </p>

                        {/* Billing toggle */}
                        <div className="mt-6 inline-flex items-center gap-0 rounded-full border border-border bg-muted p-1">
                            <button
                                onClick={() => setBillingType("monthly")}
                                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                    billingType === "monthly"
                                        ? "bg-background shadow text-foreground"
                                        : "text-foreground/50 hover:text-foreground/70"
                                }`}
                            >
                                Mensuel
                            </button>
                            <button
                                onClick={() => setBillingType("annual")}
                                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                    billingType === "annual"
                                        ? "bg-background shadow text-foreground"
                                        : "text-foreground/50 hover:text-foreground/70"
                                }`}
                            >
                                Annuel
                                <span className="ml-1.5 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    -40%
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 items-center sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {isLoadingPlans ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin size-8 text-blue-500" />
                            </div>
                        ) : proPlans ? proPlans.map((plan) => {
                            const isUltra = plan.includes_audio;
                            const accent = isUltra
                                ? { border: "border-violet-500", from: "from-violet-50 dark:from-violet-950/10", badge: "bg-violet-600", btn: "from-violet-500 to-purple-600", check: "text-violet-500" }
                                : { border: "border-blue-500",   from: "from-blue-50 dark:from-blue-950/10",   badge: "bg-blue-600",   btn: "from-blue-500 to-purple-600",   check: "text-blue-500"   };
                            return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55, ease: "easeOut" }}
                                viewport={{ once: true, amount: 0.3 }}
                                className="max-w-md mx-auto w-full"
                            >
                                <div className={`relative flex flex-col rounded-2xl border-2 ${accent.border} bg-gradient-to-br ${accent.from} to-white p-8 shadow-xl dark:to-card dark:shadow-none`}>
                                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full ${accent.badge} px-4 py-0.5 text-xs font-bold uppercase tracking-wider text-white`}>
                                        {isUltra
                                            ? <><Mic size={11} className="inline mr-1 -mt-0.5" />{plan.name}</>
                                            : <><Sparkles size={11} className="inline mr-1 -mt-0.5" />{plan.name}</>
                                        }
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                                    {plan.description && (
                                        <p className="mt-1 text-sm text-foreground/60">{plan.description}</p>
                                    )}
                                    {isUltra && (
                                        <span className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-violet-100 dark:bg-violet-900/30 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                                            <Mic size={11} /> Podcasts & Audio inclus
                                        </span>
                                    )}
                                    <div className="mt-6 flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-foreground">
                                            {billingType === "monthly" ? plan.price : plan.annual_price}
                                        </span>
                                        <span className="text-foreground/50 font-medium">
                                            $ CAD/{billingType === "monthly" ? "mois" : "an"}
                                        </span>
                                    </div>
                                    {billingType === "monthly" && (
                                        <p className="mt-1 text-xs text-foreground/40">
                                            Ou {plan.annual_price} $ CAD/an   économisez 40 %
                                        </p>
                                    )}
                                    <Link
                                        to="/register"
                                        className={`mt-8 flex items-center justify-center rounded-full h-13 px-8 bg-gradient-to-r ${accent.btn} text-white font-bold text-base shadow-lg hover:shadow-xl hover:opacity-90 transition-all`}
                                    >
                                        Commencer avec {plan.name}
                                    </Link>
                                    {plan.benefits_description?.length > 0 && (
                                        <ul className="mt-8 space-y-3">
                                            {plan.benefits_description.map((b, i) => (
                                                <li key={i} className="flex items-center gap-2.5 text-sm text-foreground/70">
                                                    <CheckCircle2 size={16} className={`${accent.check} shrink-0`} />
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </motion.div>
                            );
                        }) : (
                            <p className="text-center text-foreground/40 py-8">Plans en cours de configuration.</p>
                        )}
                        </div>
                    </div>

                {/* Bottom note */}
                <p className="mt-14 text-center text-sm text-foreground/40">
                    Paiements sécurisés via Stripe. Annulation d'abonnement à tout moment.
                </p>
            </div>
        </section>
    );
}
