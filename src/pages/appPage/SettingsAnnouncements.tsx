import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";

export default function SettingsAnnouncements() {
  const items = [
    { id: "a_001", date: "2025-10-15", title: "Nouveau: Générateur d’épreuves amélioré", body: "Meilleure qualité des questions et correction détaillée." },
    { id: "a_002", date: "2025-10-01", title: "Flashcards intelligentes", body: "Ajout de la révision espacée et suivi de progression." },
    { id: "a_003", date: "2025-09-20", title: "Mises à jour de sécurité", body: "Amélioration de la protection et de la confidentialité des données." },
  ];

  return (
    <>
      <PageMeta title="Paramètres • Annonces" description="Dernières annonces et mises à jour StudyLink" />
      <PageBreadcrumb pageTitle="Annonces" />

      <section className="space-y-4">
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
