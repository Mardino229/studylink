import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";

export default function SettingsSubscription() {
  const plans = [
    {
      id: "free",
      name: "Gratuit",
      price: "0€",
      period: "/mois",
      features: ["Résumés limités", "Flashcards de base", "Assistant IA (limité)"],
      cta: "Utiliser",
    },
    {
      id: "standard",
      name: "Standard",
      price: "9,99€",
      period: "/mois",
      features: [
        "Résumés illimités",
        "Flashcards intelligentes",
        "Assistant IA",
        "Générateur d’épreuves",
      ],
      cta: "Choisir Standard",
      recommended: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: "19,99€",
      period: "/mois",
      features: [
        "Tout Standard",
        "Corrections avancées",
        "Export premium",
        "Priorité support",
      ],
      cta: "Choisir Pro",
    },
  ];

  return (
    <>
      <PageMeta title="Paramètres • Abonnement" description="Gérer votre plan d’abonnement" />
      <PageBreadcrumb pageTitle="Changer de plan" />

      <section className="space-y-8">
        <div className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground">Votre abonnement</h2>
          <p className="text-sm text-foreground/70 mt-1">Sélectionnez un plan qui correspond à vos besoins. Aucun paiement réel ici (mock frontend).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className={`p-6 rounded-xl border border-border bg-background ${p.recommended ? "ring-2 ring-blue-500" : ""}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
                {p.recommended && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">Recommandé</span>
                )}
              </div>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-bold text-foreground">{p.price}</span>
                <span className="text-foreground/60">{p.period}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="inline-block size-1.5 rounded-full bg-foreground/40" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button size={"sm"} className="mt-6 w-full rounded-lg text-sm font-medium hover:opacity-90">
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
