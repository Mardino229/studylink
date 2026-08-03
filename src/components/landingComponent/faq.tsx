import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Faq() {
    const { t } = useTranslation('landing');
    const faqs = t('faq.items', { returnObjects: true }) as { q: string; a: string }[];

    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));

    return (
        <section className="py-12 sm:py-28 bg-muted rounded-xl" id="faq">
            <div className="container mx-auto sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-[0.2em] mb-4">
                        {t('faq.section_label')}
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                        {t('faq.title')}
                    </h2>
                </div>

                <div className="max-w-7xl grid xl:grid-cols-2 p-4 xl:gap-6 xl:space-y-0 mx-auto space-y-3 items-start">
                    {/*{faqs.map(({ q, a }, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div
                                key={i}
                                className={`rounded-2xl border transition-all duration-200 ${
                                    isOpen
                                        ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 shadow-sm"
                                        : "border-transparent bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200/70 dark:hover:bg-gray-800"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(i)}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                                >
                                    <span className={`text-base font-semibold leading-snug transition-colors ${
                                        isOpen ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                                    }`}>
                                        {q}
                                    </span>
                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-light transition-colors ${
                                        isOpen
                                            ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                            : "bg-white text-gray-500 shadow-sm dark:bg-gray-700 dark:text-gray-400"
                                    }`}>
                                        {isOpen ? "×" : "+"}
                                    </span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.22, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <p className="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                                {a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}*/}

                    {faqs.map(({ q, a }) => (
                        <details key={q} className="group border-b border-border pb-4" open={false}>
                            <summary className="flex cursor-pointer items-center justify-between gap-4">
                                <h3 className="text-lg font-semibold text-foreground">{q}</h3>
                                <svg
                                    className="size-6 shrink-0 text-foreground/60 transition-transform duration-300 group-open:rotate-180"
                                    fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth="2" viewBox="0 0 24 24"
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </summary>
                            <p className="mt-4 text-foreground/70 leading-relaxed">{a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
