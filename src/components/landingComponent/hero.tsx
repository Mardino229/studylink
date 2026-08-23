import { Link } from "react-router-dom";
import { AppLink } from "../common/AppLink";
import { motion } from "framer-motion";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import heroPic from "../../assets/hero_pic.jpg";

const HERO_BG = heroPic;

const TypingText = memo(function TypingText({ cursorColor, mutedColor }: { cursorColor: string; mutedColor: string }) {
    const { t } = useTranslation('landing');
    const phrases = t('hero.phrases', { returnObjects: true }) as string[];

    const [phraseIndex, setPhraseIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const current = phrases[phraseIndex % phrases.length] ?? "";
        const speed = isDeleting ? 38 : 65;
        const timer = setTimeout(() => {
            if (!isDeleting) {
                const next = current.slice(0, displayText.length + 1);
                setDisplayText(next);
                if (next === current) setTimeout(() => setIsDeleting(true), 1600);
            } else {
                const next = current.slice(0, displayText.length - 1);
                setDisplayText(next);
                if (next === "") {
                    setIsDeleting(false);
                    setPhraseIndex(i => i + 1);
                }
            }
        }, speed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, phraseIndex, phrases]);

    return (
        <p className={`mt-6 h-7 text-base sm:text-lg font-medium ${mutedColor}`}>
            <span>{displayText}</span>
            <span className={`inline-block w-0.5 h-5 ml-0.5 align-middle animate-pulse ${cursorColor}`} />
        </p>
    );
});

const HeroContent = memo(function HeroContent({ dark }: { dark: boolean }) {
    const { t } = useTranslation('landing');
    const chips = t('hero.chips', { returnObjects: true }) as string[];

    const textColor   = dark ? "text-white"        : "text-foreground";
    const mutedColor  = dark ? "text-white/70"     : "text-foreground/70";
    const cursorColor = dark ? "bg-white"          : "bg-foreground";
    const chipStyle   = dark
        ? "bg-white/10 border border-white/20 text-white hover:bg-white/15"
        : "bg-foreground text-background hover:opacity-90";
    const secondaryBtn = dark
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
                    {t('hero.tag')}
                </motion.p>

                <motion.h1
                    variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
                    className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tighter ${textColor}`}
                >
                    {t('hero.title')}
                </motion.h1>

                <motion.p
                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                    className={`mt-5 text-lg sm:text-xl ${mutedColor} max-w-2xl mx-auto`}
                >
                    {t('hero.subtitle')}
                </motion.p>
            </motion.div>

            <TypingText mutedColor={mutedColor} cursorColor={cursorColor} />

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-wrap justify-center gap-2"
            >
                {chips.map(item => (
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
                <AppLink
                    to="/register"
                    className="flex w-full sm:w-auto min-w-[160px] items-center justify-center rounded-full h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-base font-bold shadow-lg hover:opacity-90 transition-opacity"
                >
                    {t('hero.cta_primary')}
                </AppLink>
                <a
                    href="#pricing"
                    className={`flex w-full sm:w-auto min-w-[160px] items-center justify-center rounded-full h-14 px-8 ${secondaryBtn} text-base font-bold shadow-md transition-all`}
                >
                    {t('hero.cta_secondary')}
                </a>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={`mt-6 text-sm ${HERO_BG ? "text-white/50" : "text-foreground/40"}`}
            >
                {t('hero.pricing_note')}
            </motion.p>
        </div>
    );
});

export default function Hero() {
    return (
        <section
            id="home"
            className="relative flex min-h-[92vh] rounded-2xl items-center justify-center overflow-hidden py-20"
            style={HERO_BG ? { backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
        >
            {HERO_BG && <div className="absolute inset-0 bg-black/55" />}
            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
                <HeroContent dark={!!HERO_BG} />
            </div>
        </section> 
    );
}
