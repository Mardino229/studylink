import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label.tsx";
import Input from "../../components/form/input/InputField.tsx";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {useModal} from "../../hoooks/useModal.ts";
import {RotatingLines} from "react-loader-spinner";
import Button from "../../components/ui/button/Button.tsx";
import { useCreateFeedback } from "../../utils/feedback.ts";
import Select from "../../components/form/Select.tsx";

// Schéma de validation avec Zod pour le formulaire Feedback
const feedbackSchema = z.object({
  email: z.email("L'email doit être valide").optional().or(z.literal("")),
  rating: z.number().min(1, "Veuillez donner une note").max(5, "La note maximale est 5"),
  message: z.string().min(1, "Le message est requis").min(10, "Le message doit contenir au moins 10 caractères"),
});

// Type déduit du schéma Zod
type FeedbackFormData = z.infer<typeof feedbackSchema>;

export default function Settings() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("FR");
  const [newsletter, setNewsletter] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [rating, setRating] = useState<number>(5);

  const { isOpen, openModal, closeModal } = useModal();
  const mutation = useCreateFeedback();

  // Configuration de React Hook Form avec Zod
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      email: "",
      rating: 5,
      message: "",
    },
  });

  // Gestion de la soumission
  const onSubmit: SubmitHandler<FeedbackFormData> = (data) => {
    mutation.mutate(
      {
        email: data.email,
        rating: rating,
        message: data.message,
      },
      {
        onSuccess: () => {
          reset();
          setRating(5);
          closeModal();
        },
      }
    );
  };

  // Fermer le modal et réinitialiser le formulaire
  const handleCloseModal = () => {
    reset();
    setRating(5);
    closeModal();
  };

  // Gérer le changement de rating
  const handleRatingChange = (value: number) => {
    setRating(value);
    setValue("rating", value);
  };

  return (
    <>
      <PageMeta
        title="Settings"
        description="Manage your settings and preferences"
      />
      <PageBreadcrumb pageTitle="Settings" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Abonnement / Plan</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Gérez votre plan, consultez vos crédits et votre historique de paiements.</p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button className="w-full" onClick={() => navigate("/settings/subscription")}>Changer de plan</Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/settings/payments")}>Historique de paiements</Button>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Mon profil</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Mettez à jour vos informations personnelles.</p>
            <Button className="w-full" variant="outline" onClick={() => navigate("/profile")}>Modifier le profil</Button>
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
                <input className="block w-full border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:outline-none" placeholder="Votre message" />
                <Button className="w-full">Contacter l’assistance</Button>
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
            <Button className="w-full mt-3" variant="outline" onClick={() => navigate("/settings/announcements")}>Voir les annonces</Button>
          </section>

          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">À propos</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Mission de StudyLink, description de la plateforme et coordonnées de contact.</p>
            <Button className="w-full mt-3" variant="outline" onClick={openModal}>Laisser un avis</Button>
          </section>
        </div>
        </div>
      </div>

      {/* Modal pour laisser un avis */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Laisser un avis
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Partagez votre retour sur StudyLink
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                  <div className="col-span-1">
                    <Label>Votre e-mail (optionnel)</Label>
                    <Input
                      type="email"
                      placeholder="vous@exemple.com"
                      {...register("email")}
                      error={!!errors.email}
                      hint={errors.email?.message}
                    />
                  </div>

                  <div className="col-span-1">
                    <Label>Note</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => handleRatingChange(n)}
                          className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-semibold transition-all ${
                            n <= rating
                              ? "bg-yellow-400 border-yellow-500 text-gray-900 shadow-md"
                              : "bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                          }`}
                          aria-label={`Note ${n}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    {errors.rating && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.rating.message}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <Label>Votre message</Label>
                    <textarea
                      placeholder="Dites-nous ce que vous aimez et ce que nous pouvons améliorer…"
                      {...register("message")}
                      className={`w-full rounded-lg border ${
                        errors.message
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                          : "border-gray-200 focus:border-brand-300 focus:ring-brand-500/10"
                      } bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-800 dark:text-white/90 px-3 py-2.5 min-h-32 text-sm shadow-theme-xs placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:ring`}
                    />
                    {errors.message?.message && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.message?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

              <div className="flex items-center gap-3 px-2 mt-6 justify-end">
                <Button size="sm"
                        variant="outline"
                        onClick={closeModal}
                >
                  Close
                </Button>

                <Button size="sm"
                        disabled={mutation.isPending}
                        variant={mutation.isPending ? "outline" : "primary"}
                        className={`${mutation.isPending || mutation.isPending && "bg-background"} px-4 py-2 rounded-md bg-primary text-background`}
                >
                  {mutation.isPending ? (
                      <RotatingLines
                          visible={true}
                          strokeWidth="5"
                          width="20"
                          strokeColor="#3b82f6"
                          animationDuration="0.75"
                          ariaLabel="rotating-lines-loading"
                      />
                  ) : "Envoyer l'avis"}
                </Button>

              </div>

          </form>
        </div>
      </Modal>
    </>
  );
}
