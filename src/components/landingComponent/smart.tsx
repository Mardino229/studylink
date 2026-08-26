import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Upload, Sparkles, MessageCircle, TrendingUp } from "lucide-react";

const STEP_ICONS = [Upload, Sparkles, MessageCircle, TrendingUp];

const STEP_STYLES = [
    {
        color: "text-blue-500",
        ring: "border-blue-500/40",
        glow: "bg-blue-500",
    },
    {
        color: "text-purple-500",
        ring: "border-purple-500/40",
        glow: "bg-purple-500",
    },
    {
        color: "text-cyan-500",
        ring: "border-cyan-500/40",
        glow: "bg-cyan-500",
    },
    {
        color: "text-emerald-500",
        ring: "border-emerald-500/40",
        glow: "bg-emerald-500",
    },
];

export default function Smart() {
    const { t } = useTranslation("landing");

    const steps = t("smart.steps", {
        returnObjects: true,
    }) as { title: string; desc: string }[];

    return (
        <section
            className="py-16 sm:py-28 bg-background"
            id="how-it-works"
        >
            <div className="container mx-auto px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-14 sm:mb-20"
                >
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-transparent via-border to-blue-500/50" />

                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-center">
                            {t("smart.title")}{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {t("smart.title_highlight")}
                            </span>
                        </h2>

                        <div className="hidden sm:block h-px flex-1 bg-gradient-to-l from-transparent via-border to-purple-500/50" />
                    </div>

                    <p className="mt-4 mx-auto max-w-2xl text-center text-base sm:text-lg text-foreground/65">
                        {t("smart.subtitle")}
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative mx-auto max-w-3xl">

                    {/* Vertical line */}
                    <div className="absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-blue-500/50 via-purple-500/40 to-emerald-500/50 sm:block" />

                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={{
                            hidden: {},
                            show: {
                                transition: {
                                    staggerChildren: 0.15,
                                },
                            },
                        }}
                        className="space-y-10 sm:space-y-0"
                    >
                        {steps.map((step, i) => {
                            const Icon = STEP_ICONS[i];
                            const style = STEP_STYLES[i];
                            const isLeft = i % 2 === 0;
                            const isLast = i === steps.length - 1;

                            return (
                                <motion.div
                                    key={i}
                                    variants={{
                                        hidden: {
                                            opacity: 0,
                                            y: 20,
                                        },
                                        show: {
                                            opacity: 1,
                                            y: 0,
                                            transition: {
                                                duration: 0.55,
                                                ease: "easeOut",
                                            },
                                        },
                                    }}
                                    className="relative sm:min-h-[150px] sm:flex sm:items-center"
                                >
                                    {/* Content */}
                                    <div
                                        className={`
                                            w-full sm:w-[calc(50%-45px)]
                                            ${isLeft
                                                ? "sm:mr-auto sm:text-right"
                                                : "sm:ml-auto sm:text-left"
                                            }
                                        `}
                                    >
                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div
                                                className={`
                                                    flex items-center gap-3
                                                    ${isLeft
                                                        ? "sm:flex-row-reverse"
                                                        : ""
                                                    }
                                                `}
                                            >
                                                {/* Icon */}
                                                <div
                                                    className={`
                                                        relative shrink-0
                                                        flex h-12 w-12 items-center justify-center
                                                        rounded-full
                                                        border ${style.ring}
                                                        bg-background
                                                        ${style.color}
                                                        shadow-sm
                                                    `}
                                                >
                                                    <Icon size={19} strokeWidth={2} />

                                                    {/* Glow */}
                                                    <span
                                                        className={`
                                                            absolute inset-0 rounded-full
                                                            ${style.glow}
                                                            opacity-10 blur-md
                                                        `}
                                                    />
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-foreground">
                                                        {step.title}
                                                    </h3>

                                                    <p className="mt-1 text-sm leading-relaxed text-foreground/60">
                                                        {step.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Center node */}
                                    <div
                                        className={`
                                            absolute left-1/2 top-1/2 hidden
                                            -translate-x-1/2 -translate-y-1/2
                                            sm:flex
                                            h-10 w-10 items-center justify-center
                                            rounded-full
                                            border-2 ${style.ring}
                                            bg-background
                                            z-10
                                        `}
                                    >
                                        <div
                                            className={`
                                                h-2.5 w-2.5 rounded-full
                                                ${style.glow}
                                                shadow-[0_0_10px_currentColor]
                                            `}
                                        />

                                        {isLast && (
                                            <div
                                                className={`
                                                    absolute inset-0 rounded-full
                                                    ${style.glow}
                                                    opacity-10 animate-pulse
                                                `}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Start */}
                    <div className="absolute left-1/2 -top-7 hidden -translate-x-1/2 sm:flex flex-col items-center">
                        <span className="text-xs font-medium text-foreground/50">
                            Start
                        </span>
                        <div className="mt-2 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
                    </div>

                    {/* End */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                        className="mt-8 -bottom-7 hidden sm:flex flex-col items-center text-center"
                    >
                        <div className="flex h-2 w-2 items-center justify-center rounded-full border-2 border-emerald-500/40 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                            
                        </div>

                        <p className="mt-3 text-sm font-medium text-emerald-500">
                            {t("smart.completed", "You're all set!")}
                        </p>

                    </motion.div>
                </div>
            </div>
        </section>
    );
}