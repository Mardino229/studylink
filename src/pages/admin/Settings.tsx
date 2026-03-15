import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { toast } from "sonner";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import Button from "../../components/ui/button/Button.tsx";
import PasswordChangeCard from "../../components/common/PasswordChangeCard.tsx";

export default function AdminSettings() {
  const [maintenance, setMaintenance] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [emailFrom, setEmailFrom] = useState("no-reply@studylink.app");
  const [supportEmail, setSupportEmail] = useState("support@studylink.app");

  const save = () => {
    toast.success("Paramètres enregistrés");
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Paramètres" description="Paramètres d'administration" />
      <PageBreadcrumb pageTitle="Paramètres" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Général" desc="Paramètres de base du fonctionnement de l'application">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Mode maintenance</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowRegistration}
                onChange={(e) => setAllowRegistration(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Autoriser les inscriptions</span>
            </label>
          </div>
        </ComponentCard>

        <ComponentCard title="Emails" desc="Configuration des adresses email sortantes">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expéditeur par défaut
              </label>
              <input
                value={emailFrom}
                onChange={(e) => setEmailFrom(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email support
              </label>
              <input
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 outline-none text-sm dark:text-white/90"
              />
            </div>
          </div>
        </ComponentCard>
      </div>

      <PasswordChangeCard />

      <div className="flex justify-end">
        <Button onClick={save}>
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
}
