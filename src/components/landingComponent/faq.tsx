import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
    {
        q: "Que permet BlueCurve ?",
        a: "BlueCurve génère l'ensemble de tes outils d'étude et de révision à partir des contenus que tu lui fournis : résumés, flashcards et quiz à partir de tes fichiers ou de vidéos YouTube. Tu disposes aussi d'une bibliothèque d'épreuves dont certaines sont corrigées, d'un assistant de révision, de podcasts audio et d'outils de suivi de ta progression.",
    },
    {
        q: "Puis-je utiliser une vidéo YouTube comme source ?",
        a: "Oui. Colle l'URL d'une vidéo YouTube publique dans l'espace dédié de ton espace de travail. BlueCurve en extrait le contenu et le rend disponible comme n'importe quelle autre source. Génère ensuite des résumés, des flashcards et des quiz à partir de la vidéo. Les vidéos privées ou non listées ne sont pas prises en charge, et la durée maximale est d'environ 1 heure.",
    },
    {
        q: "Comment fonctionne le système de jetons ?",
        a: "Si tu ne disposes pas d'un abonnement, chaque fonctionnalité consomme des jetons : 1 jeton pour générer un résumé, des flashcards ou un quiz, 1 jeton par tranche de 10 messages de chat, 1 jeton pour accéder à une épreuve et 2 jetons pour accéder à un corrigé payant. Tu achètes un pack de jetons (Starter, Standard ou Maxi) et tu les utilises à ton rythme, sans date d'expiration pour les jetons.",
    },
    {
        q: "Quelle est la différence entre l'abonnement Pro et les packs de jetons ?",
        a: "Avec les packs de jetons, vous payez à la consommation. L'abonnement Pro donne un accès illimité à toutes les fonctionnalités, sans jamais déduire de jetons pendant toute la durée de l'abonnement. Pro est idéal si vous générez beaucoup de contenu chaque mois.",
    },
    {
        q: "Les épreuves et corrigés sont-ils tous payants ?",
        a: "Oui. L'accès à une épreuve nécessite 1 jeton, et l'accès à son corrigé nécessite 2 jetons, sauf avec un abonnement Pro ou Ultra actif qui donne un accès illimité aux deux.",
    },
    {
        q: "Mes anciens résumés et générations disparaissent-ils si je n'ai plus de jetons ?",
        a: "Non. Tes créations déjà générées (résumés, flashcards, quiz) restent accessibles indéfiniment, même si ton solde de jetons tombe à zéro ou si ton abonnement expire.",
    },
    {
        q: "Puis-je utiliser BlueCurve sur mobile ?",
        a: "Oui. Le site et l'application s'adaptent automatiquement à ton téléphone, pour une expérience aussi fluide que sur ordinateur.",
    },
];

export default function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));

    return (
        <section className="py-12 sm:py-28 bg-background" id="faq">
            <div className="container mx-auto sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-[0.2em] mb-4">
                        Questions fréquentes
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                        Frequently Asked Questions
                    </h2>
                </div>

                {/* Accordion */}
                <div className="max-w-7xl grid xl:grid-cols-2 xl:gap-6 xl:space-y-0 mx-auto space-y-3 items-start">
                    {FAQS.map(({ q, a }, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div
                                key={q}
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
                    })}
                </div>
            </div>
        </section>
    );
}
