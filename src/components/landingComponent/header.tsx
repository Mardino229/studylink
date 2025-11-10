import {Link, useLocation} from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import ThemeToggle from "../common/ThemeToggle";


export default function Header() {

    const location = useLocation();
    const hash = location.hash || "";
    const [activeSection, setActiveSection] = useState<string>(hash || "#");

    const [scrolled, setScrolled] = useState(false);
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
        const ids = ["key-features", "testimonials"]; // home is handled by scroll position
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

    const isHomeActive = activeSection === "#";
    const isFeaturesActive = activeSection === "#key-features";
    const isTestimonialsActive = activeSection === "#testimonials";

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
                className="container cursor-pointer mx-auto flex items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-8 py-4"
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
                        href="#testimonials"
                        onClick={(e) => handleSmoothClick(e, "#testimonials")}
                    >
                        Testimonials
                        <span className={`pointer-events-none absolute left-0 -bottom-1 block h-[2px] w-full origin-left bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-300 ${isTestimonialsActive ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100`} />
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
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-base font-bold shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                        <span className="truncate">Start Free Trial</span>
                    </Link>
                </div>
            </div>
        </motion.header>
        {/* Spacer to prevent content from being hidden under the fixed header */}
        <div aria-hidden className="h-16" />
    </div>
    )
}