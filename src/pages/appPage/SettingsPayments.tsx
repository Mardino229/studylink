import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import HistoryPaymentTableOne from "../../components/table/BasicTables/HistoryPaymentTableOne";

export default function SettingsPayments() {
  return (
    <>
      <PageMeta title="Paramètres • Historique des paiements" description="Consultez votre historique de paiements" />
      <PageBreadcrumb pageTitle="Historique des paiements" />

      <HistoryPaymentTableOne />
    </>
  );
}


