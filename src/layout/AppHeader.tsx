import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import UserDropdown from "../components/header/UserDropdown";
import NotificationDropdown from "../components/header/NotificationDropdown.tsx";
import { useBilling } from "../context/BillingContext";
import { useUser } from "../components/layout/userContext.tsx";
import logo from "../assets/study-removebg-preview.png";
import {
    BarChart3, BadgeCheck, Bell, BookMarked, BookOpen,
    CreditCard, Layers, LayoutDashboard, LogOut, Megaphone,
    MessageSquare, Receipt, Search, Settings, ShieldCheck,
    Sparkles, Users, User, Zap,
} from "lucide-react";
import { useLogout } from "../utils/auth";
import ConfirmModal from "../components/ui/ConfirmModal";

// ── Regular user navigation ──────────────────────────────────────
const USER_NAV = [
    { label: "Dashboard",                desc: "Tableau de bord",             path: "/home",                    icon: LayoutDashboard },
    { label: "Workspaces",               desc: "Mes notebooks d'étude",        path: "/workspaces",              icon: BookOpen },
    { label: "Bibliothèque d'épreuves",  desc: "Examens et corrigés",          path: "/exam-library",            icon: BookMarked },
    { label: "Mon profil",               desc: "Informations personnelles",     path: "/profile",                 icon: User },
    { label: "Statistiques",             desc: "Statistiques d'étude",         path: "/statistics",              icon: BarChart3 },
    { label: "Paramètres",               desc: "Préférences de compte",        path: "/settings",                icon: Settings },
    { label: "Abonnement & jetons",      desc: "Plans Pro et packs de jetons",  path: "/subscription",  icon: CreditCard },
    { label: "Historique des paiements", desc: "Mes transactions",             path: "/settings/payments",       icon: Receipt },
    { label: "Annonces",                 desc: "Actualités GoStudyEasy",       path: "/settings/announcements",  icon: Bell },
    { label: "Feedback",                 desc: "Donnez votre avis",            path: "/settings/feedback",       icon: MessageSquare },
];

// ── Admin navigation ─────────────────────────────────────────────
const ADMIN_NAV = [
    { label: "Admin   Vue d'ensemble",    desc: "Tableau de bord admin",       path: "/admin/home",              icon: ShieldCheck },
    { label: "Admin   Utilisateurs",      desc: "Gestion des comptes",         path: "/admin/users",             icon: Users },
    { label: "Admin   Abonnements",       desc: "Abonnements actifs",          path: "/admin/subscriptions",     icon: BadgeCheck },
    { label: "Admin   Plans",             desc: "Plans d'abonnement",          path: "/admin/plans",             icon: Layers },
    { label: "Admin   Jetons",            desc: "Packs de jetons",             path: "/admin/token-packs",       icon: Zap },
    { label: "Admin   Paiements",         desc: "Historique des transactions",  path: "/admin/payments",          icon: CreditCard },
    { label: "Admin   Épreuves",          desc: "Bibliothèque d'épreuves",     path: "/admin/exam-library",      icon: BookMarked },
    { label: "Admin   Annonces",          desc: "Annonces et sondages",        path: "/admin/announcements",     icon: Megaphone },
    { label: "Admin   Feedbacks",         desc: "Retours utilisateurs",        path: "/admin/feedbacks",         icon: MessageSquare },
    { label: "Admin   Rapports",          desc: "Rapports et statistiques",    path: "/admin/reports",           icon: BarChart3 },
    { label: "Admin   Paramètres",        desc: "Configuration système",       path: "/admin/settings",          icon: Settings },
];

// ── Token badge ──────────────────────────────────────────────────
function TokenStatusBadge() {
    const { isPro, isUltra, tokenBalance, isLoading } = useBilling();
    if (isLoading) return null;

    if (isPro) {
        return (
            <Link to="/subscription" className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90">
                <Sparkles size={12} />
                Pro
            </Link>
        );
    }
    if (isUltra) {
        return (
            <Link to="/subscription" className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90">
                <Sparkles size={12} />
                Ultra
            </Link>
        );
    }

    if (tokenBalance > 0) {
        return (
            <Link to="/subscription" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                <Zap size={12} className="text-amber-500" />
                {tokenBalance} jeton{tokenBalance > 1 ? "s" : ""}
            </Link>
        );
    }
    return (
        <Link to="/subscription" className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
            <Zap size={12} />
            Recharger
        </Link>
    );
}

// ── Main header ──────────────────────────────────────────────────
const AppHeader: React.FC = () => {
    const navigate = useNavigate();
    const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
    const { user } = useUser();
    const logout = useLogout();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

    const isAdmin = user?.role?.name === "admin";

    // Search state
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Build the item list based on role
    const ALL_NAV = isAdmin ? ADMIN_NAV : USER_NAV;

    const filtered = query.trim()
        ? ALL_NAV.filter(item =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.desc.toLowerCase().includes(query.toLowerCase())
        )
        : ALL_NAV;

    const handleToggle = () => {
        if (window.innerWidth >= 1024) toggleSidebar();
        else toggleMobileSidebar();
    };

    const goTo = useCallback((path: string) => {
        navigate(path);
        setQuery("");
        setOpen(false);
        setActiveIndex(0);
        inputRef.current?.blur();
    }, [navigate]);

    // ⌘K / Ctrl+K → focus input
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
                setOpen(true);
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    // Click outside → close
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filtered[activeIndex]) goTo(filtered[activeIndex].path);
        } else if (e.key === "Escape") {
            setQuery("");
            setOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <header className="sticky top-0 z-99999 flex w-full border-b border-gray-200/60 bg-white/70 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/60">
            <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
                <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">

                    {/* Sidebar toggle */}
                    <button
                        className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
                        onClick={handleToggle}
                        aria-label="Toggle Sidebar"
                    >
                        {isMobileOpen ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" /></svg>
                        ) : (
                            <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z" fill="currentColor" /></svg>
                        )}
                    </button>

                    {/* Mobile logo */}
                    <Link to="/" className="lg:hidden">
                        <img src={logo} alt="GoStudyEasy" className="h-8 w-auto" />
                    </Link>

                    {/* Mobile menu toggle + logout */}
                    <div className="flex items-center gap-1 lg:hidden">
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
                            aria-label="Déconnexion"
                        >
                            <LogOut size={20} />
                        </button>
                        <button onClick={() => setApplicationMenuOpen(!isApplicationMenuOpen)} className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z" fill="currentColor" /></svg>
                        </button>
                    </div>

                    {/* Search input   desktop only */}
                    <div className="relative hidden lg:block">
                        {/* Input */}
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <Search size={16} />
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => { setQuery(e.target.value); setOpen(true); setActiveIndex(0); }}
                            onFocus={() => setOpen(true)}
                            onKeyDown={handleKeyDown}
                            placeholder="Rechercher une page…"
                            className="h-11 w-[300px] xl:w-[400px] rounded-lg border border-gray-200 bg-transparent py-2.5 pl-10 pr-14 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-600"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-1.5 py-1 text-[10px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                            ⌘K
                        </span>

                        {/* Dropdown */}
                        {open && filtered.length > 0 && (
                            <div
                                ref={dropdownRef}
                                className="absolute left-0 top-full mt-2 w-full min-w-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50"
                            >
                                {query === "" && (
                                    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                                        Navigation rapide
                                    </p>
                                )}
                                <ul className="py-1">
                                    {filtered.map((item, i) => {
                                        const Icon = item.icon;
                                        const isActive = i === activeIndex;
                                        return (
                                            <li key={item.path}>
                                                <button
                                                    type="button"
                                                    onMouseEnter={() => setActiveIndex(i)}
                                                    onClick={() => goTo(item.path)}
                                                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                                        isActive
                                                            ? "bg-blue-50 dark:bg-blue-500/10"
                                                            : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                                                    }`}
                                                >
                                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                        isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                    }`}>
                                                        <Icon size={15} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`text-sm font-medium ${isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}>
                                                            {item.label}
                                                        </p>
                                                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                    {isActive && (
                                                        <kbd className="ml-auto shrink-0 rounded border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-600 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                            ↵
                                                        </kbd>
                                                    )}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-800">
                                    <p className="text-[10px] text-gray-400 dark:text-gray-600">
                                        ↑↓ Naviguer · ↵ Ouvrir · Echap Fermer
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* No results */}
                        {open && query !== "" && filtered.length === 0 && (
                            <div ref={dropdownRef} className="absolute left-0 top-full mt-2 w-full min-w-[300px] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    Aucune page correspondante
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side */}
                <div className={`${isApplicationMenuOpen ? "flex" : "hidden"} items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}>
                    <div className="flex items-center gap-2 2xsm:gap-3">
                        <TokenStatusBadge />
                        {/*<NotificationDropdown />*/}
                    </div>
                    <UserDropdown />
                </div>
            </div>
            <ConfirmModal
                isOpen={showLogoutModal}
                title="Déconnexion"
                message="Êtes-vous sûr de vouloir vous déconnecter ?"
                confirmLabel="Se déconnecter"
                cancelLabel="Annuler"
                onConfirm={() => logout.mutate()}
                onCancel={() => setShowLogoutModal(false)}
            />
        </header>
    );
};

export default AppHeader;
