import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { useState } from "react";

export default function SettingsFeedback() {
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Frontend-only mock submit
      await new Promise((r) => setTimeout(r, 600));
      setSubmitted(true);
      setMessage("");
      setEmail("");
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta title="Paramètres • Laisser un avis" description="Partagez votre retour sur StudyLink" />
      <PageBreadcrumb pageTitle="Laisser un avis" />

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
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-foreground/70 mb-1">Votre e-mail (optionnel)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm text-foreground/70 mb-1">Note</label>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  className={`w-10 h-10 rounded-md border border-border flex items-center justify-center ${n <= rating ? "bg-yellow-400/80 text-black" : "bg-background text-foreground/70"}`}
                  aria-label={`Note ${n}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-foreground/70 mb-1">Votre message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2 min-h-32"
              placeholder="Dites-nous ce que vous aimez et ce que nous pouvons améliorer…"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-md bg-foreground text-background disabled:opacity-60"
            >
              {submitting ? "Envoi…" : "Envoyer l'avis"}
            </button>
            {submitted && (
              <span className="text-sm text-emerald-600">Merci pour votre retour !</span>
            )}
          </div>
        </form>
      </section>
    </>
  );
}
