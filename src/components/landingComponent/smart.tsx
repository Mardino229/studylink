import { motion } from "framer-motion";

const STEPS = [
    {
        n: "1",
        title: "Importez vos fichiers",
        desc: "Déposez un PDF, DOCX ou PPTX dans votre workspace. L'IA analyse le contenu et en extrait les concepts clés.",
    },
    {
        n: "2",
        title: "Générez vos artefacts",
        desc: "En un clic : résumé, flashcards ou quiz. Chaque génération coûte 1 jeton — ou zéro avec l'abonnement Pro.",
    },
    {
        n: "3",
        title: "Révisez avec le chat IA",
        desc: "Posez vos questions à un assistant qui s'appuie sur vos propres documents pour vous répondre avec précision.",
    },
    {
        n: "4",
        title: "Suivez votre progression",
        desc: "Vos statistiques, notebooks et artefacts restent accessibles en permanence, même après désabonnement.",
    },
];

const MOCK_MODULES = [
    { label: "Résumés",   sub: "Contenu synthétisé",    color: "text-blue-600 dark:text-blue-400" },
    { label: "Flashcards", sub: "Questions-réponses",    color: "text-purple-600 dark:text-purple-400" },
    { label: "Quiz",       sub: "Auto-évaluation",       color: "text-amber-600 dark:text-amber-400" },
    { label: "Épreuves",   sub: "Bibliothèque d'exams", color: "text-emerald-600 dark:text-emerald-400" },
];

export default function Smart() {
    return (
        <section className="py-20 sm:py-28 bg-background" id="how-it-works">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-14 lg:grid-cols-2 lg:items-center">

                    {/* Left — steps */}
                    <div className="order-2 lg:order-1">
                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                        >
                            <motion.p
                                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                                className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3"
                            >
                                Parcours
                            </motion.p>
                            <motion.h2
                                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                                className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
                            >
                                Un chemin simple pour réviser sans se disperser
                            </motion.h2>
                            <motion.p
                                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                                className="mt-4 text-lg text-foreground/70"
                            >
                                StudyLink centralise vos cours, vos résumés, vos examens, votre chat IA et vos statistiques de progression.
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
                            className="mt-8 space-y-4"
                        >
                            {STEPS.map(({ n, title, desc }) => (
                                <motion.div
                                    key={n}
                                    variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } } }}
                                    className="flex gap-4 rounded-2xl border border-border bg-card p-5"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                        {n}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{title}</h3>
                                        <p className="mt-1 text-sm text-foreground/70">{desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right — mock UI */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.3 }}
                        className="order-1 lg:order-2"
                    >
                        <div className="rounded-3xl dark:from-white/[0.04] dark:to-white/[0.01]">
                            <div className="rounded-2xl border border-border bg-background p-5">
                                <div className="flex items-center justify-between gap-4 mb-5">
                                    <div>
                                        <p className="text-xs text-foreground/50">Mon workspace</p>
                                        <h3 className="mt-0.5 text-lg font-bold text-foreground">Notebook — Microéconomie</h3>
                                    </div>
                                    <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                                        3 sources
                                    </div>
                                </div>

                                {/* Mock artefacts */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {MOCK_MODULES.map(({ label, sub, color }) => (
                                        <div key={label} className="rounded-xl border border-border bg-card p-4">
                                            <div className={`text-sm font-semibold ${color}`}>{label}</div>
                                            <div className="mt-0.5 text-xs text-foreground/50">{sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Mock token balance */}
                                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/10 px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Solde de jetons</p>
                                        <p className="text-lg font-black text-amber-800 dark:text-amber-300">🪙 12 jetons</p>
                                    </div>
                                    <div className="text-xs text-amber-600 dark:text-amber-400 font-medium text-right">
                                        <p>1 jeton / génération</p>
                                        <p>2 jetons / corrigé</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
