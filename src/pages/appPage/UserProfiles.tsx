import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { useUser } from "../../utils/user.ts";
import UserMetaCard from "../../components/UserProfile/UserMetaCard.tsx";
import UserInfoCard from "../../components/UserProfile/UserInfoCard.tsx";
import PasswordChangeCard from "../../components/common/PasswordChangeCard.tsx";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function UserProfiles() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageMeta title="Mon Profil" description="Gérez vos paramètres de profil" />
      <PageBreadcrumb pageTitle="Mon Profil" />

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span>Retour aux paramètres</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
            <UserMetaCard />
            <UserInfoCard />
        </div>
        <div>
            <PasswordChangeCard />
        </div>
      </div>
    </div>
  );
}
