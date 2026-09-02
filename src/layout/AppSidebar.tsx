import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/mylogo.png";
import {
    ChevronDownIcon,
    GridIcon,
    HorizontaLDots,
    ListIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { Coins, CreditCard, DockIcon, SendHorizonal, SettingsIcon } from "lucide-react";
import { UserCircleIcon } from "../icons";
import { useTranslation } from "react-i18next";

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
    const { t } = useTranslation('app');
    const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
    const location = useLocation();
    const [openSubmenu, setOpenSubmenu] = useState<{ type: "main"; index: number } | null>(null);
    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const navItems: NavItem[] = [
        { icon: <GridIcon />,              name: t('sidebar.nav_dashboard'),    path: "/home" },
        { icon: <ListIcon />,              name: t('sidebar.nav_workspaces'),   path: "/workspaces" },
        { icon: <DockIcon />,              name: t('sidebar.nav_exam_library'), path: "/exam-library" },
        { icon: <SendHorizonal size={20}/>,name: t('sidebar.nav_submissions'),  path: "/my-submissions" },
        { icon: <Coins size={20}/>,        name: t('sidebar.nav_coins'),        path: "/coins" },
        { icon: <CreditCard size={20}/>,   name: t('sidebar.nav_subscription'), path: "/subscription" },
        { icon: <UserCircleIcon />,        name: t('sidebar.nav_profile'),      path: "/profile" },
        { icon: <SettingsIcon />,          name: t('sidebar.nav_settings'),     path: "/settings" },
    ];

    const isActive = useCallback(
        (path: string) => location.pathname.startsWith(path),
        [location.pathname]
    );

    useEffect(() => {
        let submenuMatched = false;
        navItems.forEach((nav, index) => {
            if (nav.subItems) {
                nav.subItems.forEach((subItem) => {
                    if (isActive(subItem.path)) {
                        setOpenSubmenu({ type: "main", index });
                        submenuMatched = true;
                    }
                });
            }
        });
        if (!submenuMatched) setOpenSubmenu(null);
    }, [location, isActive]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `main-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight(prev => ({ ...prev, [key]: subMenuRefs.current[key]?.scrollHeight || 0 }));
            }
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (index: number) => {
        setOpenSubmenu(prev =>
            prev && prev.index === index ? null : { type: "main", index }
        );
    };

    const renderMenuItems = (items: NavItem[]) => (
        <ul className="flex flex-col gap-4">
            {items.map((nav, index) => (
                <li key={nav.name}>
                    {nav.subItems ? (
                        <button
                            onClick={() => handleSubmenuToggle(index)}
                            className={`menu-item group ${
                                openSubmenu?.index === index ? "menu-item-active" : "menu-item-inactive"
                            } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                        >
                            <span className={`menu-item-icon-size ${openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                                {nav.icon}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <span className="menu-item-text">{nav.name}</span>
                            )}
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""}`} />
                            )}
                        </button>
                    ) : (
                        nav.path && (
                            <Link
                                to={nav.path}
                                onClick={() => { if (isMobileOpen) toggleMobileSidebar(); }}
                                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
                            >
                                <span className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text">{nav.name}</span>
                                )}
                            </Link>
                        )
                    )}
                    {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                        <div
                            ref={el => { subMenuRefs.current[`main-${index}`] = el; }}
                            className="overflow-hidden transition-all duration-300"
                            style={{ height: openSubmenu?.index === index ? `${subMenuHeight[`main-${index}`]}px` : "0px" }}
                        >
                            <ul className="mt-2 space-y-1 ml-9">
                                {nav.subItems.map(subItem => (
                                    <li key={subItem.name}>
                                        <Link
                                            to={subItem.path}
                                            onClick={() => { if (isMobileOpen) toggleMobileSidebar(); }}
                                            className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                                        >
                                            {subItem.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
                ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                <Link to="/home" className="flex items-center gap-2">
                    <img src={logo} alt="BlueCurve" className="lg:h-12 w-auto shrink-0" />
                    {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="text-lg font-bold text-foreground whitespace-nowrap">BlueCurve</span>
                    )}
                </Link>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                                {isExpanded || isHovered || isMobileOpen ? (
                                    t('sidebar.menu')
                                ) : (
                                    <HorizontaLDots className="size-6" />
                                )}
                            </h2>
                            {renderMenuItems(navItems)}
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default AppSidebar;
