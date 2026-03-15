import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { useUser } from "../../components/layout/userContext.tsx";
import { useState } from "react";

export default function SettingsProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Mock local update only; backend handled elsewhere
      setUser?.({ ...(user || {}), first_name: firstName, last_name: lastName, email });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageMeta title="Paramètres • Profil" description="Modifier vos informations personnelles" />
      <PageBreadcrumb pageTitle="Modifier le profil" />

      <div className="pt-6">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span>Retour aux paramètres</span>
        </button>
      </div>

      <section className="p-6 rounded-lg border border-border bg-card max-w-2xl mt-6">
        <form onSubmit={onSave} className="space-y-5">
          <div>
            <label className="block text-sm text-foreground/70 mb-1">Prénom</label>
            <input value={firstName} onChange={(e)=> setFirstName(e.target.value)}
                   className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-1">Nom</label>
            <input value={lastName} onChange={(e)=> setLastName(e.target.value)}
                   className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-1">E-mail</label>
            <input type="email" value={email} onChange={(e)=> setEmail(e.target.value)}
                   className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2" required />
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving}
                    className="px-4 py-2 rounded-md bg-foreground text-background disabled:opacity-60">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
