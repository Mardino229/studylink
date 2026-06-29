import { motion } from "framer-motion";
import { BookOpen, Bot, HelpCircle, Layers, BookMarked, Zap } from "lucide-react";

const USE_CASES = [
    {
        icon: BookOpen,
        color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        quote: "J'importe mes slides de cours et j'obtiens un résumé condensé en 30 secondes. Je révise l'essentiel sans relire 80 pages.",
        label: "Résumés IA",
        sub: "À partir de PDF, DOCX ou PPTX",
    },
    {
        icon: Layers,
        color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
        quote: "Les flashcards générées reprennent exactement les termes de mon prof. En 10 minutes de révision par jour, je mémorise tout.",
        label: "Flashcards",
        sub: "Questions-réponses personnalisées",
    },
    {
        icon: HelpCircle,
        color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
        quote: "Je génère un quiz de 10 questions avant chaque intra. Le score instantané me montre exactement où je bloque.",
        label: "Quiz IA",
        sub: "Auto-évaluation avant les examens",
    },
    {
        icon: BookMarked,
        color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        quote: "La bibliothèque d'épreuves me permet de m'entraîner sur les vrais sujets des années passées — avec les corrigés inclus en Pro.",
        label: "Bibliothèque d'épreuves",
        sub: "Épreuves filtrées par cours",
    },
    {
        icon: Bot,
        color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
        quote: "Je colle une photo d'un exercice dans le chat et l'IA m'explique la démarche en s'appuyant sur mes propres notes de cours.",
        label: "Chat IA",
        sub: "Basé sur vos documents",
    },
    {
        icon: Zap,
        color: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
        quote: "J'ai acheté le pack Standard à 7,99 $. Ça m'a tenu toute une session sans avoir à m'abonner — parfait pour les périodes d'examens.",
        label: "Packs de jetons",
        sub: "Payez à la demande, sans engagement",
    },
];

export default function Testimonial() {
    return (
        <section className="py-20 sm:py-28 bg-muted/40" id="testimonials">
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
                        Cas d'usage
                    </motion.p>
                    <motion.h2
                        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                        className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
                    >
                        Ce que vous pouvez faire avec StudyLink
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
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } } }}
                    className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {USE_CASES.map(({ icon: Icon, color, quote, label, sub }) => (
                        <motion.div
                            key={label}
                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
                            className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                                <Icon size={20} />
                            </div>
                            <p className="flex-1 text-foreground/70 text-sm leading-relaxed italic">
                                "{quote}"
                            </p>
                            <div className="mt-6 pt-5 border-t border-border">
                                <p className="font-bold text-foreground text-sm">{label}</p>
                                <p className="text-xs text-foreground/50 mt-0.5">{sub}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
