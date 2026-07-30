import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/mylogo.png";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import ThemeToggle from "../common/ThemeToggle";

const SECTION_IDS = ["key-features", "how-it-works", "pricing", "testimonials", "faq"];

export default function Header() {
    const location = useLocation();
    const [activeSection, setActiveSection] = useState<string>(location.hash || "#");
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Ref so callbacks always read the latest value without becoming stale deps
    const activeSectionRef = useRef(activeSection);
    useEffect(() => { activeSectionRef.current = activeSection; }, [activeSection]);

    // All event setup in a single effect that runs once
    useEffect(() => {
        let rafId = 0;

        const onScroll = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const y = window.scrollY;
                setScrolled(y > 8);
                if (y <= 40 && activeSectionRef.current !== "#") {
                    setActiveSection("#");
                    history.replaceState(null, "", "#");
                }
            });
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        const elements = SECTION_IDS
            .map(id => document.getElementById(id))
            .filter((el): el is HTMLElement => Boolean(el));

        const observer = new IntersectionObserver(
            (entries) => {
                if (window.scrollY <= 40) return;
                const hit = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (hit) {
                    const hashVal = `#${hit.target.id}`;
                    if (activeSectionRef.current !== hashVal) {
                        setActiveSection(hashVal);
                        history.replaceState(null, "", hashVal);
                    }
                }
            },
            { root: null, rootMargin: "-25% 0px -65% 0px", threshold: 0.15 }
        );
        elements.forEach(el => observer.observe(el));

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", onScroll);
            observer.disconnect();
        };
    }, []); // ← runs once, no dependencies

    const isActive = (hash: string) => activeSection === hash;

    const handleSmoothClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetHash: string) => {
        e.preventDefault();
        setMobileOpen(false);
        if (!targetHash || targetHash === "#") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setActiveSection("#");
            history.replaceState(null, "", "#");
            return;
        }
        const el = document.getElementById(targetHash.replace("#", ""));
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveSection(targetHash);
            history.replaceState(null, "", targetHash);
        }
    }, []);

    const linkCls = (hash: string) =>
        `group relative inline-block text-base font-medium transition-colors ${
            isActive(hash) ? "text-foreground" : "text-foreground/70 hover:text-foreground"
        }`;
    const underline = (hash: string) =>
        `pointer-events-none absolute left-0 -bottom-1 h-[2px] w-full origin-left bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-300 ${
            isActive(hash) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`;

    const NAV_LINKS = [
        { label: "Accueil",         hash: "#" },
        { label: "Comment ça marche",  hash: "#how-it-works" },
        { label: "Fonctionnalités", hash: "#key-features" },
        { label: "Offres",          hash: "#pricing" },
        { label: "FAQ",             hash: "#faq" },
    ];

    return (
        <div>
            <motion.header
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md transition-shadow duration-300 ${
                    scrolled
                        ? "bg-background/90 border-b border-border shadow-sm"
                        : "bg-background/80"
                }`}
            >
                <div className="container mx-auto flex items-center justify-between sm:px-6 lg:px-8 py-3">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 text-foreground">
                        <img src={logo} alt="BlueCurve" className="sm:h-12 h-8 w-auto" />
                         <span className="text-2xl font-bold leading-tight tracking-tighter">BlueCurve</span> 
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden xl:flex items-center gap-8">
                        {NAV_LINKS.map(({ label, hash }) => (
                            <a
                                key={hash}
                                href={hash}
                                onClick={(e) => handleSmoothClick(e, hash)}
                                className={linkCls(hash)}
                            >
                                {label}
                                <span className={underline(hash)} />
                            </a>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link
                            to="/login"
                            className="hidden sm:inline-block text-base font-medium text-foreground/70 hover:text-foreground transition-colors"
                        >
                            Connexion
                        </Link>
                        <Link
                            to="/register"
                            className="hidden md:flex items-center justify-center rounded-full h-10 px-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold shadow hover:opacity-90 transition-opacity"
                        >
                            Commencer
                        </Link>
                        {/* Mobile hamburger */}
                        <button
                            type="button"
                            aria-label="Toggle menu"
                            className="xl:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-foreground/5"
                            onClick={() => setMobileOpen(v => !v)}
                        >
                            {mobileOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                                    <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className="xl:hidden border-t border-border bg-background/95 backdrop-blur-sm"
                    >
                        <div className="px-4 sm:px-6 flex justify-between items-center flex-col justify-between gap-6 py-4 space-y-3">
                            {NAV_LINKS.map(({ label, hash }) => (
                                <a
                                    key={hash}
                                    href={hash}
                                    onClick={(e) => handleSmoothClick(e, hash)}
                                    className={`block text-base ${isActive(hash) ? "text-foreground font-semibold" : "text-foreground/70"} hover:text-foreground transition-colors`}
                                >
                                    {label}
                                </a>
                            ))}
                            <div className="pt-2 flex flex-col items-center gap-4 border-t border-border">
                                <Link to="/login" className="text-base text-foreground/70 hover:text-foreground" onClick={() => setMobileOpen(false)}>
                                    Connexion
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center rounded-full h-10 px-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Commencer
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.header>

            <div aria-hidden className="h-16" />
        </div>
    );
}
