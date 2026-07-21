import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import Select from "../../components/form/Select.tsx";

export default function Settings() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("FR");
  const [newsletter, setNewsletter] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <>
      <PageMeta title="Settings" description="Manage your settings and preferences" />
      <PageBreadcrumb pageTitle="Settings" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-base font-semibold mb-3">Abonnement / Plan</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Gérez votre plan, consultez vos crédits et votre historique de paiements.</p>
              <div className="flex items-center gap-3 flex-wrap">
                <Button className="w-full" onClick={() => navigate("/subscription")}>Changer de plan</Button>
                <Button className="w-full" variant="outline" onClick={() => navigate("/settings/payments")}>Historique de paiements</Button>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-base font-semibold mb-3">Mon profil</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Mettez à jour vos informations personnelles.</p>
              <Button className="w-full" variant="outline" onClick={() => navigate("/profile")}>Modifier le profil</Button>
            </section>

            {/*<section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-3">FAQ & Assistance</h2>
              <div className="space-y-3">
                <details className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                  <summary className="cursor-pointer font-medium">Comment utiliser les résumés ?</summary>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Téléversez vos documents et générez un résumé, puis créez des flashcards pour réviser.</p>
                </details>
                <details className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                  <summary className="cursor-pointer font-medium">Comment générer une épreuve ?</summary>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Utilisez l'assistant d'épreuves en 3 étapes dans la section Mes épreuves et examens.</p>
                </details>
              </div>
            </section>*/}
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-base font-semibold mb-3">Personnalisation</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Langue</div>
                  <Select
                    options={[
                      { value: "FR", label: "Français" },
                      { value: "EN", label: "English" }
                    ]}
                    value={language}
                    onChange={(value) => setLanguage(value)}
                    placeholder="Sélectionner une langue"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
                  Activer les notifications
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
                  Recevoir l'infolettre
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-base font-semibold mb-3">Sondages & Annonces</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Participez aux sondages pour gagner des récompenses et suivez les annonces importantes.</p>
              <Button className="w-full mt-3" variant="outline" onClick={() => navigate("/settings/announcements")}>Voir les annonces</Button>
            </section>

            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h2 className="text-base font-semibold mb-3">Support & Feedback</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Signalez un bug, suggérez une fonctionnalité ou partagez votre avis sur GoStudyEasy.</p>
              <Button className="w-full mt-3" variant="outline" onClick={() => navigate("/settings/feedback")}>Contacter le support</Button>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
