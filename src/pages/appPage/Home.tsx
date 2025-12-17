import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import {useUser} from "../../components/layout/userContext.tsx";
import ProgressMetrics from "../../components/dashboard/ProgressMetrics.tsx";
import MonthlyTarget from "../../components/dashboard/MonthlyTarget.tsx";
import {Bot} from "lucide-react";
import {FileIcon} from "../../icons";
import Button from "../../components/ui/button/Button.tsx";
import UpcomingSchedule from "../../components/dashboard/UpcomingSchedule.tsx";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Calendar from "../../components/dashboard/Calendar.tsx";

export default function Home() {
    const {user} = useUser();
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -30]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.85]);

    const fadeUp = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
    };
    const container = {
        show: { transition: { staggerChildren: 0.08 } },
    };

    // Typing effect for hero headline
    const phrases = useMemo(() => [
        `Bienvenue ${user?.first_name ? user.first_name : "sur"} StudyLink`,
        "Révisez plus efficacement",
        "Générez résumés et examens",
        "Votre copain d’étude IA",
    ], [user?.first_name]);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const current = phrases[phraseIndex % phrases.length] || "";
        const speed = isDeleting ? 40 : 70;
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // typing
                const next = current.slice(0, displayText.length + 1);
                setDisplayText(next);
                if (next === current) {
                    // pause then start deleting
                    setTimeout(() => setIsDeleting(true), 1000);
                }
            } else {
                // deleting
                const next = current.slice(0, Math.max(0, displayText.length - 1));
                setDisplayText(next);
                if (next.length === 0) {
                    setIsDeleting(false);
                    setPhraseIndex((i) => (i + 1) % phrases.length);
                }
            }
        }, speed);
        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, phraseIndex, phrases]);

    const HERO_BG = ""; // Renseignez une URL d’image (ex: /assets/hero.jpg ou https://...)

  return (
    <>
      {/* Scroll progress */}
      <motion.div style={{ scaleX: scrollYProgress }} className="fixed left-0 right-0 top-0 h-1 origin-left bg-blue-600/70 z-30" />
      <PageMeta
        title="Dashboard"
        description="This is your dashboard"
      />
        <PageBreadcrumb pageTitle="Dashboard" />
        <div className="relative overflow-hidden bg-slate-50 dark:bg-background min-h-dvh rounded-none">
        {/* Hero with background image */}
        <div
            className="relative mb-6 rounded-xl border border-border overflow-hidden"
            style={{
                backgroundImage: HERO_BG ? `url(${HERO_BG})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: 160,
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-transparent" />
            <div className="relative p-6">
                <motion.h3
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ y: yHero, opacity: opacityHero }}
                    className="font-semibold text-white text-2xl sm:text-3xl"
                >
                    {displayText}
                    <span className="ml-1 inline-block w-0.5 h-6 align-middle bg-white/90 animate-pulse" />
                </motion.h3>
                <p className="mt-2 text-white/80 text-sm">Faites défiler pour découvrir vos objectifs, progrès et actions rapides.</p>
            </div>
        </div>

        <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-12 gap-4 md:gap-6"
        >

            <motion.div
                variants={fadeUp}
                className="col-span-12 xl:col-span-5"
            >
                <MonthlyTarget />
            </motion.div>
            <div className="col-span-12 space-y-6 xl:col-span-7">
                <motion.div variants={fadeUp}>
                    <ProgressMetrics />
                </motion.div>
                <motion.div
                    variants={fadeUp}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="p-6 rounded-lg border border-border bg-card shadow-sm hover:shadow-md"
                >
                    <h2 className="text-xl font-semibold mb-4 text-foreground">Actions rapides</h2>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 justify-between flex-wrap items-center">
                            <motion.div whileHover={{ scale: 0.98 }}>
                                <Button className="flex items-center ">
                                        <span className="material-icons text-foreground/70"> <FileIcon classname="size-8"/> </span>
                                    <span className="font-medium md:block hidden text-foreground/90">Nouveau résumé</span>
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 0.98 }}>
                                <Button className="flex items-center ">
                                        <span className="material-icons text-foreground/70"> <FileIcon/> </span>
                                    <span className="font-medium md:block hidden text-foreground/90">Créer un examen</span>
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 0.98 }}>
                                <Button className="flex items-center">
                                    <span className="material-icons text-foreground/70"><Bot/></span>
                                    <span className="font-medium md:block hidden text-foreground/90">Copain d'étude IA</span>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div
                variants={fadeUp}
                className="col-span-12 xl:col-span-5"
            >
                <UpcomingSchedule/>
            </motion.div>

            <div className="col-span-12 xl:col-span-7">
                <div className="space-y-8">
                    <motion.div
                        variants={fadeUp}
                        className="p-6 rounded-lg border border-border bg-card shadow-sm"
                    >
                        <Calendar />
                    </motion.div>
                    <motion.div
                        variants={fadeUp}
                        className="p-6 rounded-lg border border-border bg-card shadow-sm"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-foreground">Reprises de
                            flashcards</h2>
                        <div className="grid items-end grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div whileHover={{ y: -2 }} className="bg-background p-4 rounded-lg border border-border">
                                <p className="text-sm text-foreground/70 mb-2">Physique</p>
                                <p className="font-medium text-foreground mb-4">Formule d'énergie
                                    cinétique ?</p>
                                <button
                                    className="w-full bg-card border border-border rounded-lg py-2 text-sm font-medium text-foreground hover:bg-card/80 transition-colors">Réviser
                                </button>
                            </motion.div>
                            <motion.div whileHover={{ y: -2 }} className="bg-background p-4 rounded-lg border border-border">
                                <p className="text-sm text-foreground/70 mb-2">Biologie</p>
                                <p className="font-medium text-foreground mb-4">Rôle des
                                    ribosomes</p>
                                <button
                                    className="w-full bg-card border border-border rounded-lg py-2 text-sm font-medium text-foreground hover:bg-card/80 transition-colors">Réviser
                                </button>
                            </motion.div>
                            <motion.div whileHover={{ y: -2 }} className="bg-background p-4 rounded-lg border border-border">
                                <p className="text-sm text-foreground/70 mb-2">Anglais</p>
                                <p className="font-medium text-foreground mb-4">Past perfect vs past
                                    simple</p>
                                <button
                                    className="w-full bg-card border border-border rounded-lg py-2 text-sm font-medium text-foreground hover:bg-card/80 transition-colors">Réviser
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
            {/*<div className="col-span-12 xl:col-span-7">*/}
            {/*    <RecentOrders />*/}
            {/*</div>*/}
        </motion.div>
        </div>
    </>
  );
}
