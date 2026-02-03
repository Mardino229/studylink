import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { Outlet } from "react-router-dom";
import AppHeader from "../AppHeader";
import Backdrop from "../Backdrop";
import AdminSidebar from "./AdminSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  return (
    <div className="min-h-screen xl:flex bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div>
        <AdminSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="px-4 py-6 mx-auto max-w-(--breakpoint-2xl) md:px-6 md:py-8">
          <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm shadow-sm p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}
