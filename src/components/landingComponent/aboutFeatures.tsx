import { motion } from "framer-motion";
import { BookOpen, Bot, Layers, HelpCircle, BookMarked, FolderKanban, Mic } from "lucide-react";

const FEATURES = [
    {
        icon: BookOpen,
        color: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400",
        glow: "bg-blue-400",
        span: "lg:col-span-4",
        wide: true,
        title: "Cours & Résumés",
        desc: "Créez vos matières, importez vos fichiers (PDF, DOCX, PPTX) et obtenez un résumé structuré prêt à réviser en quelques secondes.",
        n: "01",
    },
    {
        icon: Layers,
        color: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/15 dark:text-purple-400",
        glow: "bg-purple-400",
        span: "lg:col-span-2",
        wide: false,
        title: "Flashcards",
        desc: "Transformez n'importe quel document en jeu de flashcards question-réponse. Révisez par tranche, à votre rythme.",
        n: "02",
    },
    {
        icon: HelpCircle,
        color: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400",
        glow: "bg-amber-400",
        span: "lg:col-span-2",
        wide: false,
        title: "Quiz",
        desc: "Générez des questionnaires à choix multiples pour vous tester avant un examen. Score et corrections instantanés.",
        n: "03",
    },
    {
        icon: Bot,
        color: "bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/15 dark:text-cyan-400",
        glow: "bg-cyan-400",
        span: "lg:col-span-4",
        wide: true,
        title: "Assistant de révision",
        desc: "Posez vos questions et obtenez des réponses précises basées sur vos propres documents. Idéal pour débloquer une notion avant un partiel.",
        n: "04",
    },
    {
        icon: BookMarked,
        color: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400",
        glow: "bg-emerald-400",
        span: "lg:col-span-3",
        wide: false,
        title: "Bibliothèque d'épreuves",
        desc: "Accédez aux épreuves passées et à leurs corrigés avec vos jetons (1 jeton par épreuve, 2 pour un corrigé), ou sans limite avec le Pro.",
        n: "05",
    },
    {
        icon: FolderKanban,
        color: "bg-orange-500/10 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400",
        glow: "bg-orange-400",
        span: "lg:col-span-3",
        wide: false,
        title: "Workspaces & Statistiques",
        desc: "Organisez vos notebooks par dossier, suivez votre progression et gardez une vue d'ensemble de vos révisions.",
        n: "06",
    },
    {
        icon: Mic,
        color: "bg-violet-500/10 text-violet-500 dark:bg-violet-500/15 dark:text-violet-400",
        glow: "bg-violet-400",
        span: "lg:col-span-6",
        wide: true,
        title: "Audio & Podcasts — Ultra",
        desc: "Transformez vos résumés en briefings audio et générez des podcasts complets à partir de vos documents. Écoutez vos révisions en déplacement, en mode mains libres. Disponible en exclusivité avec le plan Ultra.",
        n: "07",
        badge: "Ultra",
    },
];

export default function AboutFeatures() {
    return (
        <section className="py-12 sm:py-28 bg-background" id="key-features">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <motion.p
                        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                        className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400"
                    >
                        Fonctionnalités
                    </motion.p>
                    <motion.h2
                        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                        className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                    >
                        Tout ce qu'il faut pour réviser{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            vraiment efficacement
                        </span>
                    </motion.h2>
                    <motion.p
                        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                        className="mt-4 text-lg text-foreground/70"
                    >
                        Résumés, flashcards, quiz, bibliothèque d'épreuves, chat, podcasts audio et statistiques — réunis dans une seule interface.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
                    className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6"
                >
                    {FEATURES.map(({ icon: Icon, color, glow, span, wide, title, desc, n, badge }) => (
                        <motion.div
                            key={title}
                            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
                            className={`group relative overflow-hidden rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${span} ${badge ? "border-violet-400/40 bg-gradient-to-br from-violet-50/60 to-card dark:from-violet-950/20 dark:to-card" : "border-border bg-card"}`}
                        >
                            {/* Hover glow blob */}
                            <div
                                className={`pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-20 ${glow}`}
                            />

                            {/* Decorative number */}
                            <span className="absolute right-5 top-3 select-none text-5xl font-black leading-none text-foreground/[0.05]">
                                {n}
                            </span>

                            {/* Ultra badge */}
                            {badge && (
                                <span className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                                    <Mic size={11} />
                                    {badge}
                                </span>
                            )}

                            {wide ? (
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
                                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                                        <Icon size={26} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-foreground/70">{desc}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                                        <Icon size={22} />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-foreground/70">{desc}</p>
                                </>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
