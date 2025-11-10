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
            <PageMeta title={"Welcome to Studylink"} description="Studylink your best way to review your lessons" />
            <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    <Header/>
                    <main className="flex-1">
                        <Hero />
                        <AboutFeatures />
                        <Smart />
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