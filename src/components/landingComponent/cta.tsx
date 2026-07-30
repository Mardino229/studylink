import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCallback } from "react";
import { CheckCircle2 } from "lucide-react";

const BULLETS = [
    "Gratuit pour commencer",
    "Packs de jetons sans expiration",
    "Abonnements Pro et Ultra annulables à tout moment",
];

export default function Cta() {
    const fireConfetti = useCallback(() => {
        import("canvas-confetti").then(({ default: confetti }) => {
            const count = 90;
            const defaults = { origin: { y: 0.65 } } as const;
            const fire = (r: number, opts: object) =>
                confetti({ ...defaults, ...opts, particleCount: Math.floor(count * r) });
            fire(0.25, { spread: 26, startVelocity: 45 });
            fire(0.2,  { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
            fire(0.1,  { spread: 120, startVelocity: 35, decay: 0.92, scalar: 1.1 });
            fire(0.1,  { spread: 120, startVelocity: 25 });
        }).catch(() => {});
    }, []);

    return (
        <section className="py-20 sm:py-28 bg-background">
            <div className="container mx-auto px-2 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.4 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 p-10 sm:p-16 text-center"
                >
                    {/* Background glow */}
                    <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                        viewport={{ once: true }}
                        className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-4"
                    >
                        Commencez maintenant
                    </motion.p>

                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                        Prêt à mieux réviser ?
                    </h2>
                    <p className="mt-4 text-lg text-blue-100 max-w-xl mx-auto">
                        Crée ton compte, importe tes fichiers ou colle un lien YouTube, et génère résumés, flashcards, quiz et podcasts en quelques secondes.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-blue-200">
                        {BULLETS.map((b) => (
                            <span key={b} className="inline-flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-blue-300" />
                                {b}
                            </span>
                        ))}
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            onClick={fireConfetti}
                            className="flex w-full sm:w-auto min-w-[180px] items-center justify-center rounded-full h-14 px-8 bg-white text-blue-600 text-base font-bold shadow-lg hover:bg-white/90 hover:shadow-xl transition-all duration-300"
                        >
                            Commencer gratuitement
                        </Link>
                        <a
                            href="#pricing"
                            className="flex w-full sm:w-auto min-w-[180px] items-center justify-center rounded-full h-14 px-8 border border-white/30 bg-white/10 text-white text-base font-bold hover:bg-white/15 transition-all duration-300"
                        >
                            Voir les offres
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
