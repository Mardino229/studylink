import {Link} from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import heroPic from "../../assets/hero_pic.jpg";

const HERO_BG = heroPic;

export default function Hero() {

    // Typing/erasing effect for the headline
    const phrases = useMemo(() => [
        "Résumer vos cours automatiquement",
        "Créer des flashcards intelligentes",
        "Générer des épreuves et corrigés",
        "Poser vos questions à l’IA",
        "Suivre votre progression",
        "Planifier vos révisions efficacement",
    ], []);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const current = phrases[phraseIndex % phrases.length] || "";
        const speed = isDeleting ? 40 : 70;
        const timer = setTimeout(() => {
            if (!isDeleting) {
                const next = current.slice(0, displayText.length + 1);
                setDisplayText(next);
                if (next === current) {
                    setTimeout(() => setIsDeleting(true), 1100);
                }
            } else {
                const next = current.slice(0, Math.max(0, displayText.length - 1));
                setDisplayText(next);
                if (next.length === 0) {
                    setIsDeleting(false);
                    setPhraseIndex((i) => (i + 1) % phrases.length);
                }
            }
        }, speed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, phraseIndex, phrases]);

    return (
        <section
            className="relative min-h-[80vh] py-28 sm:py-32 bg-background"
            style={HERO_BG ? { backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
            {HERO_BG && <div className="absolute inset-0 bg-black/40" />}
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 min-h-[92vh] flex items-center">
                <div className="grid grid-cols-1 gap-12 items-center">
                    <div className="text-center lg:text-left max-w-4xl mx-auto lg:mx-0">
                        <motion.h1
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            viewport={{ once: true, amount: 0.6 }}
                            className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tighter ${HERO_BG ? "text-white" : "text-foreground"} break-words`}
                        >
                            {displayText}
                            <span className={`ml-1 inline-block w-0.5 h-7 align-middle ${HERO_BG?"bg-white/90":"bg-foreground/80"} animate-pulse`} />
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                            viewport={{ once: true, amount: 0.6 }}
                            className={`mt-6 text-lg sm:text-xl ${HERO_BG?"text-white/85":"text-foreground/70"} max-w-xl mx-auto lg:mx-0`}
                        >
                            StudyLink is your all-in-one platform for academic success. From smart study planning to
                            collaborative learning, we've got you covered.
                        </motion.p>
                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.6 }}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
                                },
                            }}
                            className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                        >
                            <motion.div
                                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                            >
                                <Link
                                    to="/register"
                                    className={`flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 ${HERO_BG?"bg-white/10 border-white/20 text-white hover:bg-white/15":"bg-gradient-to-r from-blue-500 to-purple-600 text-white"} text-lg font-bold border shadow-lg hover:shadow-xl transition-shadow duration-300`}
                                >
                                    <span className="truncate">Start Free Trial</span>
                                </Link>
                            </motion.div>
                            
                            <motion.div
                                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                            >
                                <Link
                                    to="/about"
                                    className={`flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 ${HERO_BG?"bg-white text-black hover:bg-white/90":"bg-foreground text-background"} text-lg font-bold shadow-lg hover:shadow-xl transition-shadow duration-300`}
                                >
                                    <span className="truncate">En savoir plus</span>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}