import { motion } from "framer-motion";
import { Upload, Sparkles, MessageCircle, TrendingUp, BookOpen, Layers, Bot, BarChart2 } from "lucide-react";

const STEPS = [
    {
        n: "1",
        icon: Upload,
        color: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400",
        badge: "bg-blue-600",
        title: "Importez vos sources",
        desc: "Déposez un PDF, DOCX, PPTX   ou collez un lien YouTube. Notre app lit ou regarde la vidéo, en extrait le contenu et l'indexe comme n'importe quelle source.",
    },
    {
        n: "2",
        icon: Sparkles,
        color: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/15 dark:text-purple-400",
        badge: "bg-purple-600",
        title: "Générez vos outils de révision",
        desc: "En un clic : résumé audio, podcast, flashcards ou quiz. Chaque outils coûte 1 jeton   ou zéro avec l'abonnement Pro ou Ultra.",
    },
    {
        n: "3",
        icon: MessageCircle,
        color: "bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/15 dark:text-cyan-400",
        badge: "bg-cyan-600",
        title: "Révisez avec un assistant",
        desc: "Posez vos questions à un assistant qui s'appuie sur vos propres documents pour vous répondre avec précision.",
    },
    {
        n: "4",
        icon: TrendingUp,
        color: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400",
        badge: "bg-emerald-600",
        title: "Suivez votre progression",
        desc: "Vos statistiques, notebooks et outils de révision restent accessibles en permanence, même après désabonnement.",
    },
];

const SIDEBAR_ICONS = [BookOpen, Layers, Bot, BarChart2];

export default function Smart() {
    return (
        <section className="py-12 sm:py-28 bg-background" id="how-it-works">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:gap-14 lg:grid-cols-2 lg:items-center">

                    {/* Left   steps */}
                    
                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                        >
                            <motion.p
                                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                                className="text-xs font-semibold text-center uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3"
                            >
                                Fonctionnement
                            </motion.p>
                            <motion.h2
                                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                                className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
                            >
                                Un chemin simple pour réviser{" "}
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    sans se disperser
                                </span>
                            </motion.h2>
                            <motion.p
                                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                                className="mt-4 text-lg text-foreground/70"
                            >
                                GoStudyEasy centralise vos cours, vos résumés, vos examens, votre assistant et vos statistiques.
                            </motion.p>
                        </motion.div>

                        <div className="relative mt-10">
                            {/* Connecting line */}
                            <div className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-blue-400 via-purple-400 via-cyan-400 to-emerald-400 opacity-25" />

                            <motion.div
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.2 }}
                                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
                                className="space-y-3"
                            >
                                {STEPS.map(({ n, icon: Icon, color, badge, title, desc }) => (
                                    <motion.div
                                        key={n}
                                        variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } } }}
                                        className="group relative flex gap-4 rounded-2xl border border-border bg-card/60 p-5 hover:bg-card hover:shadow-md hover:border-border/80 transition-all duration-200"
                                    >
                                        {/* Icon with step badge */}
                                        <div className="relative z-10 shrink-0">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
                                                <Icon size={17} />
                                            </div>
                                            <span className={`absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full ${badge} text-[9px] font-black text-white`}>
                                                {n}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{title}</h3>
                                            <p className="mt-1 text-sm text-foreground/65">{desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    

                </div>
            </div>
        </section>
    );
}
