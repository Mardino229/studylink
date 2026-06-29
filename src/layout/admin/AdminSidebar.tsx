import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { LayoutDashboard, Users, BadgeCheck, Layers, CreditCard, Megaphone, MessageSquare, BarChart3, Settings as SettingsIcon, BookMarked, Zap } from "lucide-react";

export default function AdminSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const items = [
    { name: "Overview", path: "/admin/home", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Subscriptions", path: "/admin/subscriptions", icon: BadgeCheck },
    { name: "Plans", path: "/admin/plans", icon: Layers },
    { name: "Jetons", path: "/admin/token-packs", icon: Zap },
    { name: "Payments", path: "/admin/payments", icon: CreditCard },
    { name: "Épreuves", path: "/admin/exam-library", icon: BookMarked },
    { name: "Announcements", path: "/admin/announcements", icon: Megaphone },
    { name: "Feedbacks", path: "/admin/feedbacks", icon: MessageSquare },
    { name: "Reports", path: "/admin/reports", icon: BarChart3 },
    { name: "Settings", path: "/admin/settings", icon: SettingsIcon },
  ];

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm shadow-sm
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/admin/home">
          <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
          </svg>
        </Link>
      </div>
      <nav className="mb-6">
        <ul className="flex flex-col gap-2">
          {items.map((it) => (
            <li key={it.name}>
              <Link
                to={it.path}
                className={`menu-item group ${isActive(it.path) ? "menu-item-active border-l-2 border-brand-500 pl-4" : "menu-item-inactive"}`}
              >
                <span className={`menu-item-icon-size ${isActive(it.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  <it.icon />
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{it.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
