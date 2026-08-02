import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Upload, Sparkles, MessageCircle, TrendingUp } from "lucide-react";

const STEP_ICONS = [Upload, Sparkles, MessageCircle, TrendingUp];
const STEP_STYLES = [
    { color: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400",     badge: "bg-blue-600" },
    { color: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/15 dark:text-purple-400", badge: "bg-purple-600" },
    { color: "bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/15 dark:text-cyan-400",     badge: "bg-cyan-600" },
    { color: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400", badge: "bg-emerald-600" },
];

export default function Smart() {
    const { t } = useTranslation('landing');
    const steps = t('smart.steps', { returnObjects: true }) as { title: string; desc: string }[];

    return (
        <section className="py-12 sm:py-28 bg-background" id="how-it-works">
            <div className="container mx-auto sm:px-6 lg:px-8">
                <div className="grid lg:gap-14 lg:grid-cols-2 lg:items-center">

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
                            {t('smart.section_label')}
                        </motion.p>
                        <motion.h2
                            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                            className="text-3xl text-center sm:text-4xl font-bold tracking-tight text-foreground"
                        >
                            {t('smart.title')}{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {t('smart.title_highlight')}
                            </span>
                        </motion.h2>
                        <motion.p
                            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                            className="mt-4 text-center text-lg text-foreground/70"
                        >
                            {t('smart.subtitle')}
                        </motion.p>
                    </motion.div>

                    <div className="relative mt-10">
                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
                            className="space-y-3"
                        >
                            {steps.map((step, i) => {
                                const Icon = STEP_ICONS[i];
                                const { color, badge } = STEP_STYLES[i];
                                return (
                                    <motion.div
                                        key={i}
                                        variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } } }}
                                        className="group relative flex gap-4 rounded-2xl border border-border bg-card/60 p-5 hover:bg-card hover:shadow-md hover:border-border/80 transition-all duration-200"
                                    >
                                        <div className="relative z-10 shrink-0">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
                                                <Icon size={17} />
                                            </div>
                                            <span className={`absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full ${badge} text-[9px] font-black text-white`}>
                                                {i + 1}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{step.title}</h3>
                                            <p className="mt-1 text-sm text-foreground/65">{step.desc}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
