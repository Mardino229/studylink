import {Link, useLocation} from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import ThemeToggle from "../common/ThemeToggle";


export default function Header() {

    const location = useLocation();
    const hash = location.hash || "";
    const [activeSection, setActiveSection] = useState<string>(hash || "#");

    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 8);
            // Force Home active when near top, regardless of intersections
            if (y <= 40 && activeSection !== "#") {
                setActiveSection("#");
                history.replaceState(null, "", "#");
            }
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        // Scrollspy: observe sections in view
        const ids = ["key-features", "how-it-works", "pricing", "testimonials", "faq"]; // home is handled by scroll position
        const elements = ids
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => Boolean(el));

        const observer = new IntersectionObserver(
            (entries) => {
                const y = window.scrollY;
                // Top-of-page wins over any intersections
                if (y <= 40) {
                    if (activeSection !== "#") {
                        setActiveSection("#");
                        history.replaceState(null, "", "#");
                    }
                    return;
                }

                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => (b.intersectionRatio - a.intersectionRatio));
                if (visible[0]) {
                    const id = visible[0].target.id;
                    const hashVal = `#${id}`;
                    if (activeSection !== hashVal) {
                        setActiveSection(hashVal);
                        history.replaceState(null, "", hashVal);
                    }
                }
            },
            { root: null, rootMargin: "-25% 0px -65% 0px", threshold: [0.1, 0.25, 0.5, 0.75] }
        );
        elements.forEach((el) => observer.observe(el));

        return () => {
            window.removeEventListener('scroll', onScroll);
            observer.disconnect();
        };
    }, [activeSection]);

    const isHomeActive = activeSection === "#" || activeSection === "#home";
    const isFeaturesActive = activeSection === "#key-features";
    const isHowItWorksActive = activeSection === "#how-it-works";
    const isPricingActive = activeSection === "#pricing";
    const isTestimonialsActive = activeSection === "#testimonials";
    const isFaqActive = activeSection === "#faq";

    const handleSmoothClick = useCallback((e: any, targetHash: string) => {
        e.preventDefault();
        if (targetHash === "#" || targetHash === "") {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setActiveSection("#");
            history.replaceState(null, "", "#");
            return;
        }
        const id = targetHash.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(targetHash);
            history.replaceState(null, "", targetHash);
        }
    }, []);

    return (
        <div>
        <motion.header
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ boxShadow: "0 8px 30px rgba(59,130,246,0.10)" }}
            className={`fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md ${scrolled ? 'bg-background/90 border-b border-border' : 'bg-background/80'}`}
        >
            <div
                className="container cursor-pointer mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4"
            >
                <div className="flex items-center gap-3 text-foreground">
                    <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 48 48"
                         xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
                    </svg>
                    <h2 className="text-foreground text-2xl font-bold leading-tight tracking-tighter">StudyLink</h2>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    <motion.a
                        whileHover={{ y: -2 }}
                        className="group relative inline-block text-foreground/70 hover:text-foreground text-base font-medium"
                        href="#"
                        onClick={(e) => handleSmoothClick(e, "#")}
                    >
                        Home
                        <span className={`pointer-events-none absolute left-0 -bottom-1 block h-[2px] w-full origin-left bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-300 ${isHomeActive ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100`} />
                    </motion.a>
                    <motion.a
                        whileHover={{ y: -2 }}
                        className="group relative inline-block text-foreground/70 hover:text-foreground text-base font-medium"
                        href="#key-features"
                        onClick={(e) => handleSmoothClick(e, "#key-features")}
                    >
                        Key Features
                        <span className={`pointer-events-none absolute left-0 -bottom-1 block h-[2px] w-full origin-left bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-300 ${isFeaturesActive ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100`} />
                    </motion.a>
                    <motion.a
                        whileHover={{ y: -2 }}
                        className="group relative inline-block text-foreground/70 hover:text-foreground text-base font-medium"
                        href="#how-it-works"
                        onClick={(e) => handleSmoothClick(e, "#how-it-works")}
                    >
                        How It Works
                        <span className={`pointer-events-none absolute left-0 -bottom-1 block h-[2px] w-full origin-left bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-300 ${isHowItWorksActive ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100`} />
                    </motion.a>
                    <motion.a
                        whileHover={{ y: -2 }}
                        className="group relative inline-block text-foreground/70 hover:text-foreground text-base font-medium"
                        href="#pricing"
                        onClick={(e) => handleSmoothClick(e, "#pricing")}
                    >
                        Pricing
                        <span className={`pointer-events-none absolute left-0 -bottom-1 block h-[2px] w-full origin-left bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-300 ${isPricingActive ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100`} />
                    </motion.a>
                    <motion.a
                        whileHover={{ y: -2 }}
                        className="group relative inline-block text-foreground/70 hover:text-foreground text-base font-medium"
                        href="#testimonials"
                        onClick={(e) => handleSmoothClick(e, "#testimonials")}
                    >
                        Testimonials
                        <span className={`pointer-events-none absolute left-0 -bottom-1 block h-[2px] w-full origin-left bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-300 ${isTestimonialsActive ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100`} />
                    </motion.a>
                    <motion.a
                        whileHover={{ y: -2 }}
                        className="group relative inline-block text-foreground/70 hover:text-foreground text-base font-medium"
                        href="#faq"
                        onClick={(e) => handleSmoothClick(e, "#faq")}
                    >
                        FAQ
                        <span className={`pointer-events-none absolute left-0 -bottom-1 block h-[2px] w-full origin-left bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-300 ${isFaqActive ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100`} />
                    </motion.a>
                </nav>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <motion.div whileHover={{ y: -1 }} className="hidden sm:block">
                        <Link
                            to="/login"
                            className="group relative inline-block text-foreground/70 hover:text-foreground text-base font-medium"
                        >
                            Log In
                            <span className="pointer-events-none absolute left-0 -bottom-1 block h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-300 group-hover:scale-x-100" />
                        </Link>
                    </motion.div>
                    <Link
                        to={"/register"}
                        className="hidden md:flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-base font-bold shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                        <span className="truncate">Start Free Trial</span>
                    </Link>
                    <button
                        type="button"
                        aria-label="Toggle menu"
                        className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-foreground/5 focus:outline-none"
                        onClick={() => setMobileOpen((v) => !v)}
                    >
                        {mobileOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7"><path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75z" clipRule="evenodd"/></svg>
                        )}
                    </button>
                </div>
            </div>
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="md:hidden border-t border-border bg-background"
                >
                    <div className="px-4 sm:px-6 lg:px-8 py-3 space-y-3">
                        <a
                            href="#"
                            className={`block text-base ${isHomeActive ? 'text-foreground' : 'text-foreground/70'} hover:text-foreground`}
                            onClick={(e) => { handleSmoothClick(e, '#'); setMobileOpen(false); }}
                        >
                            Home
                        </a>
                        <a
                            href="#key-features"
                            className={`block text-base ${isFeaturesActive ? 'text-foreground' : 'text-foreground/70'} hover:text-foreground`}
                            onClick={(e) => { handleSmoothClick(e, '#key-features'); setMobileOpen(false); }}
                        >
                            Key Features
                        </a>
                        <a
                            href="#how-it-works"
                            className={`block text-base ${isHowItWorksActive ? 'text-foreground' : 'text-foreground/70'} hover:text-foreground`}
                            onClick={(e) => { handleSmoothClick(e, '#how-it-works'); setMobileOpen(false); }}
                        >
                            How It Works
                        </a>
                        <a
                            href="#pricing"
                            className={`block text-base ${isPricingActive ? 'text-foreground' : 'text-foreground/70'} hover:text-foreground`}
                            onClick={(e) => { handleSmoothClick(e, '#pricing'); setMobileOpen(false); }}
                        >
                            Pricing
                        </a>
                        <a
                            href="#testimonials"
                            className={`block text-base ${isTestimonialsActive ? 'text-foreground' : 'text-foreground/70'} hover:text-foreground`}
                            onClick={(e) => { handleSmoothClick(e, '#testimonials'); setMobileOpen(false); }}
                        >
                            Testimonials
                        </a>
                        <a
                            href="#faq"
                            className={`block text-base ${isFaqActive ? 'text-foreground' : 'text-foreground/70'} hover:text-foreground`}
                            onClick={(e) => { handleSmoothClick(e, '#faq'); setMobileOpen(false); }}
                        >
                            FAQ
                        </a>
                        <div className="pt-2 flex items-center gap-4">
                            <Link
                                to="/login"
                                className="text-base text-foreground/70 hover:text-foreground"
                                onClick={() => setMobileOpen(false)}
                            >
                                Log In
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center rounded-full h-11 px-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-lg"
                                onClick={() => setMobileOpen(false)}
                            >
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.header>
        {/* Spacer to prevent content from being hidden under the fixed header */}
        <div aria-hidden className="h-16" />
    </div>
    )
}