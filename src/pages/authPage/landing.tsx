import Header from "../../components/landingComponent/header.tsx";
import Hero from "../../components/landingComponent/hero.tsx";
import AboutFeatures from "../../components/landingComponent/aboutFeatures.tsx";
import Smart from "../../components/landingComponent/smart.tsx";
import Cta from "../../components/landingComponent/cta.tsx";
import Faq from "../../components/landingComponent/faq.tsx";
import Footer from "../../components/landingComponent/footer.tsx";
import Testimonial from "../../components/landingComponent/testimonial.tsx";
import Pricing from "../../components/landingComponent/pricing.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { CheckCircle2, Clock, BookOpen } from "lucide-react";


export default function Landing() {

    return (
        <>
            <PageMeta title={"Welcome to Studylink"} description="Studylink your best way to review your lessons" />
            <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    <Header/>
                    <main className="flex-1">
                        <Hero />

                        {/* <section className="px-4 md:px-6 border-y border-gray-200/60 dark:border-gray-800/60 bg-white">
                            <div className="mx-auto max-w-(--breakpoint-2xl) py-10">
                                <p className="text-center text-xs uppercase tracking-wide text-foreground/60 mb-6">Ils nous font confiance</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center">
                                    <div className="h-8 flex items-center justify-center text-gray-500 dark:text-gray-400">Logo</div>
                                    <div className="h-8 flex items-center justify-center text-gray-500 dark:text-gray-400">Logo</div>
                                    <div className="h-8 flex items-center justify-center text-gray-500 dark:text-gray-400">Logo</div>
                                    <div className="h-8 flex items-center justify-center text-gray-500 dark:text-gray-400">Logo</div>
                                    <div className="h-8 flex items-center justify-center text-gray-500 dark:text-gray-400">Logo</div>
                                    <div className="h-8 flex items-center justify-center text-gray-500 dark:text-gray-400">Logo</div>
                                </div>
                            </div>
                        </section> */}

                        <AboutFeatures />

                        <section className="px-4 md:px-6">
                            <div className="mx-auto max-w-(--breakpoint-2xl) py-14">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                    <div className="rounded-lg border border-gray-200/60 dark:border-gray-800/60 p-4 text-center">
                                        <div className="text-2xl font-semibold text-foreground">12k+</div>
                                        <div className="text-xs text-foreground/60">Étudiants</div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200/60 dark:border-gray-800/60 p-4 text-center">
                                        <div className="text-2xl font-semibold text-foreground">4.8/5</div>
                                        <div className="text-xs text-foreground/60">Note moyenne</div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200/60 dark:border-gray-800/60 p-4 text-center">
                                        <div className="text-2xl font-semibold text-foreground">25k+</div>
                                        <div className="text-xs text-foreground/60">Résumés générés</div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200/60 dark:border-gray-800/60 p-4 text-center">
                                        <div className="text-2xl font-semibold text-foreground">99.9%</div>
                                        <div className="text-xs text-foreground/60">Dispo. plateforme</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Smart />

                        <section className="px-4 md:px-6 bg-gray-50 dark:bg-white/[0.02] border-y border-gray-200/60 dark:border-gray-800/60">
                            <div className="mx-auto max-w-(--breakpoint-2xl) py-14">
                                <h2 className="text-center text-xl font-semibold text-foreground mb-8">Comment ça marche</h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="rounded-lg border border-gray-200/60 dark:border-gray-800/60 p-6">
                                        <div className="h-10 w-10 rounded-full border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-center mb-3">
                                            <BookOpen className="size-5 text-foreground" />
                                        </div>
                                        <h3 className="font-medium text-foreground mb-1">Choisissez votre cours</h3>
                                        <p className="text-sm text-foreground/70">Sélectionnez la matière et le chapitre à réviser.</p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200/60 dark:border-gray-800/60 p-6">
                                        <div className="h-10 w-10 rounded-full border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-center mb-3">
                                            <Clock className="size-5 text-foreground" />
                                        </div>
                                        <h3 className="font-medium text-foreground mb-1">Générez en quelques minutes</h3>
                                        <p className="text-sm text-foreground/70">Des résumés clairs et structurés, prêts à l’emploi.</p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200/60 dark:border-gray-800/60 p-6">
                                        <div className="h-10 w-10 rounded-full border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-center mb-3">
                                            <CheckCircle2 className="size-5 text-foreground" />
                                        </div>
                                        <h3 className="font-medium text-foreground mb-1">Apprenez efficacement</h3>
                                        <p className="text-sm text-foreground/70">Consolidez vos acquis grâce à des outils simples.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Pricing />
                        <Faq />
                        <Testimonial />
                        <Cta />
                    </main>
                    <Footer />
                </div>
            </div>
        </>
)
}