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

export default function Landing() {
    return (
        <>
            <PageMeta
                title="StudyLink — Révisez plus vite avec l'IA"
                description="Résumés, flashcards, quiz, bibliothèque d'épreuves et chat pour les étudiants de l'Université d'Ottawa."
            />
            <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    <Header />
                    <main className="flex-1">
                        {/* 1. Hook — Valeur en une phrase, CTA principal */}
                        <Hero />

                        {/* 2. Parcours — Comment ça marche en 4 étapes (montrer la simplicité TÔT) */}
                        <Smart />

                        {/* 3. Fonctionnalités — Maintenant qu'ils comprennent le flux, détailler ce qu'ils obtiennent */}
                        <AboutFeatures />

                        {/* 4. Cas d'usage — Pic du désir : "des étudiants comme moi l'utilisent ainsi" */}
                        <Testimonial />

                        {/* 5. Tarifs — Le désir est au max, montrer le prix maintenant */}
                        <Pricing />

                        {/* 6. FAQ — Lever les dernières objections (jetons, annulation, Pro vs tokens) */}
                        <Faq />

                        {/* 7. CTA final */}
                        <Cta />
                    </main>
                    <Footer />
                </div>
            </div>
        </>
    );
}
