import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { toast } from "sonner";

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
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Général</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={maintenance} onChange={(e)=>setMaintenance(e.target.checked)} />
              <span className="text-sm text-foreground">Mode maintenance</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={allowRegistration} onChange={(e)=>setAllowRegistration(e.target.checked)} />
              <span className="text-sm text-foreground">Autoriser les inscriptions</span>
            </label>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">Emails</h2>
          <div className="mt-4 flex flex-col gap-3 max-w-xl">
            <label className="text-sm text-foreground">
              Expéditeur par défaut
              <input value={emailFrom} onChange={(e)=>setEmailFrom(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-border bg-background" />
            </label>
            <label className="text-sm text-foreground">
              Email support
              <input value={supportEmail} onChange={(e)=>setSupportEmail(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-border bg-background" />
            </label>
          </div>
        </div>

        <div>
          <button onClick={save} className="px-4 py-2 rounded border border-border hover:bg-background">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
