import { Modal } from "../ui/modal";
import { useModal } from "../../hoooks/useModal.ts";
import { useState } from "react";
import { useRequestPasswordOTP, useUpdatePassword } from "../../utils/user.ts";
import { RotatingLines } from "react-loader-spinner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form.tsx";
import Button from "../ui/button/Button.tsx";
import { KeyRound, ShieldCheck } from "lucide-react";

const updatePasswordSchema = z.object({
  otp_code: z.string().length(5, "Le code OTP doit contenir 5 chiffres"),
  current_password: z.string().min(1, "Le mot de passe actuel est requis"),
  new_password: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
  confirm_new_password: z.string().min(1, "La confirmation est requise"),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_new_password"],
});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export default function PasswordChangeCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [step, setStep] = useState<1 | 2>(1);
  const requestOTP = useRequestPasswordOTP();
  const updatePassword = useUpdatePassword();

  const form = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      otp_code: "",
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });

  const handleRequestOTP = () => {
    requestOTP.mutate(undefined, {
      onSuccess: () => {
        setStep(2);
      },
    });
  };

  const onSubmit = (data: UpdatePasswordFormData) => {
    updatePassword.mutate(data, {
      onSuccess: () => {
        form.reset();
        setStep(1);
        closeModal();
      },
    });
  };

  const handleClose = () => {
    form.reset();
    setStep(1);
    closeModal();
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mb-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
            <ShieldCheck className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Sécurité
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gérez votre mot de passe et la sécurité de votre accès.
            </p>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <KeyRound size={18} />
          Modifier le mot de passe
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="mb-6">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Modifier le mot de passe
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pour votre sécurité, un code OTP est nécessaire pour changer votre mot de passe.
            </p>
          </div>

          {step === 1 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
                Cliquez sur le bouton ci-dessous pour recevoir un code de confirmation par email.
              </p>
              <Button
                onClick={handleRequestOTP}
                disabled={requestOTP.isPending}
                className="w-full justify-center"
              >
                {requestOTP.isPending ? (
                  <RotatingLines
                    visible={true}
                    strokeWidth="5"
                    width="20"
                    strokeColor="white"
                    animationDuration="0.75"
                    ariaLabel="rotating-lines-loading"
                  />
                ) : (
                  "Demander un code OTP"
                )}
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  name="otp_code"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code OTP (Reçu par email)</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          maxLength={5}
                          className="block w-full border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:outline-none dark:bg-gray-800"
                          placeholder="Ex: 12345"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="current_password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe actuel</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="password"
                          className="block w-full border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:outline-none dark:bg-gray-800"
                          placeholder="••••••••"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="new_password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="password"
                          className="block w-full border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:outline-none dark:bg-gray-800"
                          placeholder="••••••••"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="confirm_new_password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="password"
                          className="block w-full border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:outline-none dark:bg-gray-800"
                          placeholder="••••••••"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3 pt-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    disabled={updatePassword.isPending}
                    className="min-w-[140px] justify-center"
                  >
                    {updatePassword.isPending ? (
                      <RotatingLines
                        visible={true}
                        strokeWidth="5"
                        width="20"
                        strokeColor="white"
                        animationDuration="0.75"
                        ariaLabel="rotating-lines-loading"
                      />
                    ) : (
                      "Confirmer"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </Modal>
    </div>
  );
}
