import Header from "../../components/landingComponent/header.tsx";
import Footer from "../../components/landingComponent/footer.tsx";
import AboutSection from "../../components/landingComponent/about.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";

export default function About() {
  return (
    <>
      <PageMeta title="À propos • BlueCurve" description="Notre mission, notre approche et nos valeurs." />
      <div className="relative flex min-h-screen flex-col bg-white dark:bg-background">
        <div className="layout-container flex h-full grow flex-col">
          <Header />
          <main className="flex-1">
            <AboutSection />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
