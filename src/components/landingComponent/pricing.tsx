
import { motion } from "framer-motion";
import { useGetPlans } from "../../utils/plan";
import { Loader2 } from "lucide-react";

export default function Pricing() {
    const { data: plans, isLoading, isError } = useGetPlans();

    if (isError) {
        return null; // Or show a fallback
    }

    return (
        <section className="py-20 sm:py-28 bg-background" id="pricing">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Trouvez le Plan Parfait</h2>
                    <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">Choisissez l'abonnement qui correspond le mieux à vos besoins académiques et à votre budget.</p>
                </div>

                {isLoading ? (
                    <div className="mt-16 flex justify-center">
                        <Loader2 className="size-10 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {plans?.map((plan, index) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.5 + index * 0.05, ease: "easeOut" }}
                                whileHover={{ y: -8, boxShadow: "0 16px 40px rgba(59,130,246,0.18)" }}
                                className={`group relative flex flex-col border rounded-2xl p-8 bg-card overflow-hidden ${index === 1 ? "border-2 border-purple-500" : "border-border"}`}
                            >
                                <motion.div
                                    variants={{ hover: { opacity: 1, scale: 1.02 } }}
                                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition will-change-transform"
                                    style={{
                                        background: index === 1
                                            ? "radial-gradient(120% 80% at 50% 0%, rgba(168,85,247,0.18), transparent 60%)"
                                            : "radial-gradient(120% 80% at 50% 0%, rgba(59,130,246,0.15), transparent 60%)",
                                        filter: "blur(0.5px)",
                                    }}
                                />
                                {index === 1 && (
                                    <span className="absolute top-2 -translate-y-1/2 bg-purple-500 text-white text-sm font-semibold px-3 py-1 rounded-full">Plus Populaire</span>
                                )}
                                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                                <p className="mt-2 text-foreground/70">{plan.description}</p>
                                <p className="mt-6 text-4xl font-black text-foreground">
                                    {plan.price}€<span className="text-lg font-medium text-foreground/60">/mois</span>
                                </p>
                                <p className="mt-1 text-xs text-foreground/50">
                                    Ou {plan.annual_price}€ /an
                                </p>
                                <button
                                    className="mt-8 w-full flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-base font-bold shadow-lg hover:shadow-xl transition-shadow duration-300"
                                >
                                    Commencer
                                </button>
                                <ul className="mt-8 space-y-4 text-foreground/70">
                                    {plan.benefits_description.map((benefit, bIndex) => (
                                        <li key={bIndex} className="flex items-center gap-3">
                                            <svg className="size-5 text-blue-500" fill="none" stroke="currentColor"
                                                strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                viewBox="0 0 24 24">
                                                <path d="M20 6 9 17l-5-5"></path>
                                            </svg>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}