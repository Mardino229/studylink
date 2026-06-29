import { motion } from "framer-motion";
import { BookOpen, Bot, Layers, HelpCircle, BookMarked, FolderKanban } from "lucide-react";

const FEATURES = [
    {
        icon: BookOpen,
        color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        title: "Cours & Résumés",
        desc: "Créez vos matières, importez vos fichiers (PDF, DOCX, PPTX) et l'IA génère un résumé structuré prêt à réviser.",
    },
    {
        icon: Layers,
        color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
        title: "Flashcards",
        desc: "Transformez n'importe quel document en jeu de flashcards question-réponse. Révisez par tranche, à votre rythme.",
    },
    {
        icon: HelpCircle,
        color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
        title: "Quiz IA",
        desc: "Générez des questionnaires à choix multiples pour vous tester avant un examen. Score et corrections instantanés.",
    },
    {
        icon: BookMarked,
        color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        title: "Bibliothèque d'épreuves",
        desc: "Consultez et téléchargez les épreuves passées. Accédez aux corrigés avec vos jetons ou votre abonnement Pro.",
    },
    {
        icon: Bot,
        color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
        title: "Chat IA",
        desc: "Posez vos questions à un assistant qui connaît vos documents. Idéal pour débloquer une notion avant un partiel.",
    },
    {
        icon: FolderKanban,
        color: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
        title: "Workspaces & Statistiques",
        desc: "Organisez vos notebooks par dossier, suivez votre progression et gardez une vue d'ensemble de vos révisions.",
    },
];

export default function AboutFeatures() {
    return (
        <section className="pt-20 sm:py-28 bg-background" id="key-features">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                    className="text-center max-w-3xl mx-auto"
                >
                    <motion.p
                        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                        className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3"
                    >
                        Fonctionnalités
                    </motion.p>
                    <motion.h2
                        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                        className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
                    >
                        Tout ce dont vous avez besoin pour réviser
                    </motion.h2>
                    <motion.p
                        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                        className="mt-4 text-lg text-foreground/70"
                    >
                        De la gestion de cours à la génération IA de résumés, flashcards et quiz, en passant par la bibliothèque d'épreuves et le suivi de progression.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
                    }}
                    className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {FEATURES.map(({ icon: Icon, color, title, desc }) => (
                        <motion.div
                            key={title}
                            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
                            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                                <Icon size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
