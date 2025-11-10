import { useState } from "react";
import { Button } from "../../components/ui/button.tsx";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("FR");
  const [newsletter, setNewsletter] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Gérez votre abonnement, votre profil et vos préférences.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Abonnement / Plan</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Gérez votre plan, consultez vos crédits et votre historique de paiements.</p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button onClick={() => navigate("/settings/subscription")}>Changer de plan</Button>
              <Button variant="outline" onClick={() => navigate("/settings/payments")}>Historique de paiements</Button>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Mon profil</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Mettez à jour vos informations personnelles et votre photo de profil.</p>
            <Button variant="outline" onClick={() => navigate("/settings/profile")}>Modifier le profil</Button>
          </section>

          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">FAQ & Assistance</h2>
            <div className="space-y-3">
              <details className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                <summary className="cursor-pointer font-medium">Comment utiliser les résumés ?</summary>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Téléversez vos documents et générez un résumé, puis créez des flashcards pour réviser.</p>
              </details>
              <details className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                <summary className="cursor-pointer font-medium">Comment générer une épreuve ?</summary>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Utilisez l’assistant d’épreuves en 3 étapes dans la section Mes épreuves et examens.</p>
              </details>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="block w-full border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:outline-none" placeholder="Votre e-mail" />
                <Button>Contacter l’assistance</Button>
              </div>
              <p className="text-xs text-gray-500">Délai de réponse indicatif: 24-48h.</p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Personnalisation</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Langue</div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="block w-full border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm rounded-md px-2.5 py-2.5 focus:outline-none"
                >
                  <option value="FR">Français</option>
                  <option value="EN">English</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={notifications} onChange={(e)=>setNotifications(e.target.checked)} />
                Activer les notifications
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={newsletter} onChange={(e)=>setNewsletter(e.target.checked)} />
                Recevoir l’infolettre
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Sondages & Annonces</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Participez aux sondages pour gagner des récompenses et suivez les annonces importantes.</p>
            <Button className="mt-3" variant="outline" onClick={() => navigate("/settings/announcements")}>Voir les annonces</Button>
          </section>

          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">À propos</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Mission de StudyLink, description de la plateforme et coordonnées de contact.</p>
            <Button className="mt-3" variant="outline" onClick={() => navigate("/settings/feedback")}>Laisser un avis</Button>
          </section>
        </div>
      </div>
    </div>
  );
}
