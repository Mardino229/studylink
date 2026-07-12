import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { memo, useEffect, useState } from "react";
import heroPic from "../../assets/hero_pic.jpg";

const HERO_BG = heroPic;

const PHRASES = [
    "Générer des résumés en quelques secondes",
    "Créer des flashcards à partir de vos PDF",
    "Préparer des quiz de révision avec l'IA",
    "Consulter les épreuves et corrigés",
    "Discuter avec votre assistant d'étude IA",
    "Organiser vos workspaces de révision",
];

// Isolated so its frequent state updates don't re-render the whole Hero
const TypingText = memo(function TypingText({ cursorColor, mutedColor }: { cursorColor: string; mutedColor: string }) {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const current = PHRASES[phraseIndex % PHRASES.length] ?? "";
        const speed = isDeleting ? 38 : 65;
        const timer = setTimeout(() => {
            if (!isDeleting) {
                const next = current.slice(0, displayText.length + 1);
                setDisplayText(next);
                if (next === current) setTimeout(() => setIsDeleting(true), 1200);
            } else {
                const next = current.slice(0, Math.max(0, displayText.length - 1));
                setDisplayText(next);
                if (next.length === 0) {
                    setIsDeleting(false);
                    setPhraseIndex(i => (i + 1) % PHRASES.length);
                }
            }
        }, speed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, phraseIndex]);

    return (
        <p className={`mt-5 h-7 text-base sm:text-lg font-medium ${mutedColor}`}>
            {displayText}
            <span className={`ml-0.5 inline-block w-0.5 h-5 align-middle ${cursorColor} animate-pulse`} />
        </p>
    );
});

// Static content — only mounts animations once, no re-renders from typing
const HeroContent = memo(function HeroContent() {
    const textColor = HERO_BG ? "text-white" : "text-foreground";
    const mutedColor = HERO_BG ? "text-white/80" : "text-foreground/70";
    const cursorColor = HERO_BG ? "bg-white/90" : "bg-foreground/80";
    const chipStyle = HERO_BG
        ? "border-white/20 bg-white/10 text-white"
        : "border-border bg-background text-foreground/70";
    const secondaryBtn = HERO_BG
        ? "bg-white/10 border border-white/20 text-white hover:bg-white/15"
        : "bg-foreground text-background hover:opacity-90";

    return (
        <div className="mx-auto w-full max-w-4xl text-center">
            <motion.div
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}
            >
                <motion.p
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                    className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-4"
                >
                    Plateforme de révision IA
                </motion.p>

                <motion.h1
                    variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
                    className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tighter ${textColor}`}
                >
                    Révisez plus vite avec StudyLink
                </motion.h1>

                <motion.p
                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                    className={`mt-5 text-lg sm:text-xl ${mutedColor} max-w-2xl mx-auto`}
                >
                    Résumés, flashcards, quiz, bibliothèque d'épreuves et chat IA — tout ce dont vous avez besoin pour réviser, dans une seule interface.
                </motion.p>
            </motion.div>

            {/* Typing text — in its own component so its re-renders stay isolated */}
            <TypingText mutedColor={mutedColor} cursorColor={cursorColor} />

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-wrap justify-center gap-2"
            >
                {["Résumés", "Flashcards", "Quiz", "Épreuves", "Chat IA", "Workspaces"].map(item => (
                    <span key={item} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${chipStyle}`}>
                        {item}
                    </span>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.42 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
                <Link
                    to="/register"
                    className="flex w-full sm:w-auto min-w-[160px] items-center justify-center rounded-full h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-base font-bold shadow-lg hover:opacity-90 transition-opacity"
                >
                    Créer un compte gratuit
                </Link>
                <a
                    href="#pricing"
                    className={`flex w-full sm:w-auto min-w-[160px] items-center justify-center rounded-full h-14 px-8 ${secondaryBtn} text-base font-bold shadow-md transition-all`}
                >
                    Voir les tarifs
                </a>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={`mt-6 text-sm ${HERO_BG ? "text-white/50" : "text-foreground/40"}`}
            >
                Gratuit pour commencer · Packs de jetons dès 2,99 $ · Abonnement Pro dès 6,99 $/mois
            </motion.p>
        </div>
    );
});

export default function Hero() {
    return (
        <section
            id="home"
            className="relative lg:min-h-[70vh]  overflow-hidden bg-background py-24 sm:py-32"
            style={HERO_BG ? { backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
            {HERO_BG && <div className="absolute inset-0 bg-slate-950/60" />}
            <div className="relative container mx-auto flex md:min-h-[66vh] items-center px-4 sm:px-6 lg:px-8">
                <HeroContent />
            </div>
        </section>
    );
}
