
import { motion } from "framer-motion";

export default function Pricing() {

    return (
        <section className="py-20 sm:py-28 bg-background" id="pricing">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Find the Perfect
                        Plan</h2>
                    <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">Choose the subscription that best fits
                        your academic needs and budget.</p>
                </div>
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        whileHover={{ y: -8, boxShadow: "0 16px 40px rgba(59,130,246,0.18)" }}
                        className="group relative flex flex-col border border-border rounded-2xl p-8 bg-card overflow-hidden"
                    >
                        <motion.div
                            variants={{ hover: { opacity: 1, scale: 1.02 } }}
                            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition will-change-transform"
                            style={{
                                background:
                                    "radial-gradient(120% 80% at 50% 0%, rgba(59,130,246,0.15), transparent 60%)",
                                filter: "blur(0.5px)",
                            }}
                        />
                        <h3 className="text-2xl font-bold text-foreground">Free</h3>
                        <p className="mt-2 text-foreground/70">For casual learners</p>
                        <p className="mt-6 text-4xl font-black text-foreground">$0<span
                            className="text-lg font-medium text-foreground/60">/month</span></p>
                        <button
                            className="mt-8 w-full flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-base font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">Start
                            Free Trial
                        </button>
                        <ul className="mt-8 space-y-4 text-foreground/70">
                            <li className="flex items-center gap-3">
                                <svg className="size-5 text-blue-500" fill="none" stroke="currentColor"
                                     stroke-linecap="round" strokeLinejoin="round" stroke-width="2"
                                     viewBox="0 0 24 24">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                Basic document summaries
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="size-5 text-blue-500" fill="none" stroke="currentColor"
                                     stroke-linecap="round" strokeLinejoin="round" stroke-width="2"
                                     viewBox="0 0 24 24">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                Up to 10 flashcards sets
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="size-5 text-blue-500" fill="none" stroke="currentColor"
                                     stroke-linecap="round" strokeLinejoin="round" stroke-width="2"
                                     viewBox="0 0 24 24">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                Community support
                            </li>
                        </ul>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
                        whileHover={{ y: -10, boxShadow: "0 18px 44px rgba(168,85,247,0.22)" }}
                        className="group relative flex flex-col border-2 border-purple-500 rounded-2xl p-8 bg-card overflow-hidden"
                    >
                        <motion.div
                            variants={{ hover: { opacity: 1, scale: 1.02 } }}
                            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition will-change-transform"
                            style={{
                                background:
                                    "radial-gradient(120% 80% at 50% 0%, rgba(168,85,247,0.18), transparent 60%)",
                                filter: "blur(0.5px)",
                            }}
                        />
                        <span
                            className="absolute top-2 -translate-y-1/2 bg-purple-500 text-white text-sm font-semibold px-3 py-1 rounded-full">Most Popular</span>
                        <h3 className="text-2xl font-bold text-foreground">Premium</h3>
                        <p className="mt-2 text-foreground/70">For dedicated students</p>
                        <p className="mt-6 text-4xl font-black text-foreground">$12<span
                            className="text-lg font-medium text-foreground/60">/month</span></p>
                        <button
                            className="mt-8 w-full flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-base font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">Get
                            Started
                        </button>
                        <ul className="mt-8 space-y-4 text-foreground/70">
                            <li className="flex items-center gap-3">
                                <svg className="size-5 text-blue-500" fill="none" stroke="currentColor"
                                     stroke-linecap="round" strokeLinejoin="round" stroke-width="2"
                                     viewBox="0 0 24 24">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                Unlimited summaries &amp; flashcards
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="size-5 text-blue-500" fill="none" stroke="currentColor"
                                     stroke-linecap="round" strokeLinejoin="round" stroke-width="2"
                                     viewBox="0 0 24 24">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                AI-powered intelligent assistance
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="size-5 text-blue-500" fill="none" stroke="currentColor"
                                     stroke-linecap="round" strokeLinejoin="round" stroke-width="2"
                                     viewBox="0 0 24 24">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                Exam generator
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="size-5 text-blue-500" fill="none" stroke="currentColor"
                                     stroke-linecap="round" strokeLinejoin="round" stroke-width="2"
                                     viewBox="0 0 24 24">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                Priority support
                            </li>
                        </ul>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
                        whileHover={{ y: -8, boxShadow: "0 16px 40px rgba(15,23,42,0.18)" }}
                        className="group relative flex flex-col border border-border rounded-2xl p-8 bg-card overflow-hidden"
                    >
                        <motion.div
                            variants={{ hover: { opacity: 1, scale: 1.02 } }}
                            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition will-change-transform"
                            style={{
                                background:
                                    "radial-gradient(120% 80% at 50% 0%, rgba(59,130,246,0.12), transparent 60%)",
                                filter: "blur(0.5px)",
                            }}
                        />
                        <h3 className="text-2xl font-bold text-foreground">Pro</h3>
                        <p className="mt-2 text-foreground/70">For power users &amp; groups</p>
                        <p className="mt-6 text-4xl font-black text-foreground">$20<span
                            className="text-lg font-medium text-foreground/60">/month</span></p>
                        <button
                            className="mt-8 w-full flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-base font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">Contact
                            Us
                        </button>
                        <ul className="mt-8 space-y-4 text-foreground/70">
                            <li className="flex items-center gap-3">
                                <svg className="size-5 text-blue-500" fill="none" stroke="currentColor"
                                     stroke-linecap="round" strokeLinejoin="round" stroke-width="2"
                                     viewBox="0 0 24 24">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                All Premium features
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="size-5 text-blue-500" fill="none" stroke="currentColor"
                                     stroke-linecap="round" strokeLinejoin="round" stroke-width="2"
                                     viewBox="0 0 24 24">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                Real-time collaborative content
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="size-5 text-blue-500" fill="none" stroke="currentColor"
                                     stroke-linecap="round" strokeLinejoin="round" stroke-width="2"
                                     viewBox="0 0 24 24">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                Advanced analytics dashboard
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="size-5 text-blue-500" fill="none" stroke="currentColor"
                                     stroke-linecap="round" strokeLinejoin="round" stroke-width="2"
                                     viewBox="0 0 24 24">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                Dedicated account manager
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}