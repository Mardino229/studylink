import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import Select from "../../components/form/Select.tsx";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('app');
  const [notifications, setNotifications] = useState(true);
  const [newsletter, setNewsletter] = useState(true);

  const currentLang = i18n.language.startsWith('fr') ? 'FR' : 'EN';

  const handleLanguageChange = (value: string) => {
    const lang = value === 'FR' ? 'fr' : 'en';
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <>
      <PageMeta title="Settings" description="Manage your settings and preferences" />
      <PageBreadcrumb pageTitle="Settings" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-base font-semibold mb-3">{t('settings.subscription')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('settings.subscription_desc')}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <Button className="w-full" onClick={() => navigate("/subscription")}>{t('settings.change_plan')}</Button>
                <Button className="w-full" variant="outline" onClick={() => navigate("/settings/payments")}>{t('settings.payment_history')}</Button>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-base font-semibold mb-3">{t('settings.profile')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('settings.profile_desc')}</p>
              <Button className="w-full" variant="outline" onClick={() => navigate("/profile")}>{t('settings.edit_profile')}</Button>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-base font-semibold mb-3">{t('settings.customization')}</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('settings.language')}</div>
                  <Select
                    options={[
                      { value: "FR", label: t('settings.select_fr') },
                      { value: "EN", label: t('settings.select_en') }
                    ]}
                    value={currentLang}
                    onChange={handleLanguageChange}
                    placeholder={t('settings.language_placeholder')}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
                  {t('settings.enable_notifications')}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
                  {t('settings.newsletter')}
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-base font-semibold mb-3">{t('settings.announcements_section')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.announcements_desc')}</p>
              <Button className="w-full mt-3" variant="outline" onClick={() => navigate("/settings/announcements")}>{t('settings.view_announcements')}</Button>
            </section>

            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-base font-semibold mb-3">{t('settings.support')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.support_desc')}</p>
              <Button className="w-full mt-3" variant="outline" onClick={() => navigate("/settings/feedback")}>{t('settings.contact_support')}</Button>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
