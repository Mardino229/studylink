import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import UserMetaCard from "../../components/UserProfile/UserMetaCard.tsx";
import UserInfoCard from "../../components/UserProfile/UserInfoCard.tsx";
import PasswordChangeCard from "../../components/common/PasswordChangeCard.tsx";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../hoooks/useModal.ts";

export default function UserProfiles() {
  const navigate = useNavigate();
  const { t } = useTranslation('app');
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="space-y-6">
      <PageMeta title={t('profile.page_title')} description={t('profile.page_desc')} />
      <PageBreadcrumb pageTitle={t('profile.page_title')} />

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span>{t('profile.back')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
            <UserMetaCard onEdit={openModal} />
            <UserInfoCard isOpen={isOpen} onOpen={openModal} onClose={closeModal} />
        </div>
        <div>
            <PasswordChangeCard />
        </div>
      </div>
    </div>
  );
}
