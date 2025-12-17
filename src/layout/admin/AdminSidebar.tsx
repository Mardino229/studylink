import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

export default function AdminSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const items = [
    { name: "Overview", path: "/admin/home" },
    { name: "Users", path: "/admin/users" },
    { name: "Subscriptions", path: "/admin/subscriptions" },
    { name: "Plans", path: "/admin/plans" },
    { name: "Payments", path: "/admin/payments" },
    { name: "Announcements", path: "/admin/announcements" },
    { name: "Feedbacks", path: "/admin/feedbacks" },
    { name: "Reports", path: "/admin/reports" },
    { name: "Settings", path: "/admin/settings" },
  ];

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
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
                className={`menu-item group ${isActive(it.path) ? "menu-item-active" : "menu-item-inactive"}`}
              >
                <span className="menu-item-icon-size">
                  <span className={`inline-block w-2 h-2 rounded-full ${isActive(it.path) ? "bg-blue-500" : "bg-gray-400"}`} />
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
