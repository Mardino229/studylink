import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";

export default function SettingsPayments() {
  const rows = [
    { id: "p_2025_001", date: "2025-09-02", plan: "Standard", amount: "9,99€", status: "Payé", method: "Visa **** 4242" },
    { id: "p_2025_002", date: "2025-10-02", plan: "Standard", amount: "9,99€", status: "Payé", method: "Visa **** 4242" },
    { id: "p_2025_003", date: "2025-11-02", plan: "Standard", amount: "9,99€", status: "En attente", method: "Visa **** 4242" },
  ];

  return (
    <>
      <PageMeta title="Paramètres • Historique des paiements" description="Consultez votre historique de paiements" />
      <PageBreadcrumb pageTitle="Historique des paiements" />

      <section className="p-6 rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-foreground/70 border-b border-border">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Plan</th>
                <th className="py-2 pr-4">Montant</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4">Méthode</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 text-foreground/90">{r.date}</td>
                  <td className="py-3 pr-4 font-mono text-foreground/80">{r.id}</td>
                  <td className="py-3 pr-4 text-foreground/90">{r.plan}</td>
                  <td className="py-3 pr-4 text-foreground">{r.amount}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "Payé" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-foreground/80">{r.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
