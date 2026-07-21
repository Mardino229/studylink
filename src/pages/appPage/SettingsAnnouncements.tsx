import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageMeta from "../../components/common/PageMeta.tsx";

export default function SettingsAnnouncements() {
  const navigate = useNavigate();
  const items = [
    { id: "a_001", date: "2025-10-15", title: "Nouveau: Générateur d’épreuves amélioré", body: "Meilleure qualité des questions et correction détaillée." },
    { id: "a_002", date: "2025-10-01", title: "Flashcards intelligentes", body: "Ajout de la révision espacée et suivi de progression." },
    { id: "a_003", date: "2025-09-20", title: "Mises à jour de sécurité", body: "Amélioration de la protection et de la confidentialité des données." },
  ];

  return (
    <>
      <PageMeta title="Paramètres • Annonces" description="Dernières annonces et mises à jour GoStudyEasy" />
      <PageBreadcrumb pageTitle="Annonces" />

      <div className="pt-6">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span>Retour aux paramètres</span>
        </button>
      </div>

      <section className="space-y-4 pt-6">
        {items.map((a) => (
          <article key={a.id} className="p-5 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-foreground">{a.title}</h3>
              <span className="text-xs text-foreground/60">{a.date}</span>
            </div>
            <p className="mt-2 text-sm text-foreground/80">{a.body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
