import { motion } from "framer-motion";
import { BookOpen, Bot, HelpCircle, Layers, BookMarked, Zap } from "lucide-react";

const USE_CASES = [
    {
        icon: BookOpen,
        color: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400",
        accent: "bg-blue-500",
        quoteColor: "text-blue-500",
        quote: "J'importe mes slides de cours et j'obtiens un résumé condensé en 30 secondes. Je révise l'essentiel sans relire 80 pages.",
        label: "Résumés IA",
        sub: "À partir de PDF, DOCX ou PPTX",
    },
    {
        icon: Layers,
        color: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/15 dark:text-purple-400",
        accent: "bg-purple-500",
        quoteColor: "text-purple-500",
        quote: "Les flashcards générées reprennent exactement les termes de mon prof. En 10 minutes de révision par jour, je mémorise tout.",
        label: "Flashcards",
        sub: "Questions-réponses personnalisées",
    },
    {
        icon: HelpCircle,
        color: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400",
        accent: "bg-amber-500",
        quoteColor: "text-amber-500",
        quote: "Je génère un quiz de 10 questions avant chaque intra. Le score instantané me montre exactement où je bloque.",
        label: "Quiz IA",
        sub: "Auto-évaluation avant les examens",
    },
    {
        icon: BookMarked,
        color: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400",
        accent: "bg-emerald-500",
        quoteColor: "text-emerald-500",
        quote: "La bibliothèque d'épreuves me permet de m'entraîner sur les vrais sujets des années passées — avec les corrigés inclus en Pro.",
        label: "Bibliothèque d'épreuves",
        sub: "Épreuves filtrées par cours",
    },
    {
        icon: Bot,
        color: "bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/15 dark:text-cyan-400",
        accent: "bg-cyan-500",
        quoteColor: "text-cyan-500",
        quote: "Je colle une photo d'un exercice dans le chat et l'IA m'explique la démarche en s'appuyant sur mes propres notes de cours.",
        label: "Chat IA",
        sub: "Basé sur vos documents",
    },
    {
        icon: Zap,
        color: "bg-orange-500/10 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400",
        accent: "bg-orange-500",
        quoteColor: "text-orange-500",
        quote: "J'ai acheté le pack Standard à 7,99 $. Ça m'a tenu toute une session sans avoir à m'abonner — parfait pour les périodes d'examens.",
        label: "Packs de jetons",
        sub: "Payez à la demande, sans engagement",
    },
];

export default function Testimonial() {
    return (
        <section className="py-10 sm:py-12 bg-muted/40" id="testimonials">
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
                        Cas d'usage
                    </motion.p>
                    <motion.h2
                        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                        className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                    >
                        Ce que vous pouvez faire avec{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            StudyLink
                        </span>
                    </motion.h2>
                    <motion.p
                        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                        className="mt-4 text-lg text-foreground/70"
                    >
                        Des usages concrets pour chaque étape de votre révision.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } } }}
                    className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
                >
                    {USE_CASES.map(({ icon: Icon, color, accent, quoteColor, quote, label, sub }) => (
                        <motion.div
                            key={label}
                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            {/* Color accent bar */}
                            <div className={`h-1 w-full ${accent}`} />

                            <div className="flex flex-1 flex-col p-6">
                                {/* Decorative open-quote */}
                                <span className={`mb-1 select-none text-5xl font-black leading-none opacity-20 ${quoteColor}`}>
                                    "
                                </span>

                                {/* Quote */}
                                <p className="flex-1 text-[15px] leading-relaxed text-foreground/75">
                                    {quote}
                                </p>

                                {/* Footer */}
                                <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
                                        <Icon size={17} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{label}</p>
                                        <p className="mt-0.5 text-xs text-foreground/50">{sub}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
