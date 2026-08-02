import { Modal } from "../ui/modal";
import { useModal } from "../../hoooks/useModal.ts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRequestPasswordOTP, useUpdatePassword } from "../../utils/user.ts";
import { RotatingLines } from "react-loader-spinner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form.tsx";
import Button from "../ui/button/Button.tsx";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function PasswordChangeCard() {
  const { t } = useTranslation('auth');
  const { t: tErr } = useTranslation('errors');
  const { isOpen, openModal, closeModal } = useModal();
  const [step, setStep] = useState<1 | 2>(1);
  const navigate = useNavigate();
  const requestOTP = useRequestPasswordOTP();
  const updatePassword = useUpdatePassword();

  const updatePasswordSchema = z.object({
    otp_code: z.string().length(6, tErr('otp.length')),
    current_password: z.string().min(1, tErr('password.required')),
    new_password: z.string().min(8, tErr('password.new_min')),
    confirm_new_password: z.string().min(1, tErr('password.confirm_required')),
  }).refine((data) => data.new_password === data.confirm_new_password, {
    message: tErr('password.mismatch'),
    path: ["confirm_new_password"],
  });

  type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

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
        navigate("/login");
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
              {t('password_change.security_title')}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('password_change.security_desc')}
            </p>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <KeyRound size={18} />
          {t('password_change.change_btn')}
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="mb-6">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {t('password_change.title')}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('password_change.description')}
            </p>
          </div>

          {step === 1 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
                {t('password_change.request_otp_desc')}
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
                  t('password_change.request_otp_btn')
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
                      <FormLabel>{t('password_change.otp_label')}</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          maxLength={6}
                          className="block w-full border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:outline-none dark:bg-gray-800"
                          placeholder={t('password_change.otp_placeholder')}
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
                      <FormLabel>{t('password_change.current_password_label')}</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="password"
                          className="block w-full border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:outline-none dark:bg-gray-800"
                          placeholder={t('password_change.current_password_placeholder')}
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
                      <FormLabel>{t('password_change.new_password_label')}</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="password"
                          className="block w-full border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:outline-none dark:bg-gray-800"
                          placeholder={t('password_change.new_password_placeholder')}
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
                      <FormLabel>{t('password_change.confirm_password_label')}</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="password"
                          className="block w-full border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:outline-none dark:bg-gray-800"
                          placeholder={t('password_change.confirm_password_placeholder')}
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
                    {t('password_change.back')}
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
                      t('password_change.submit')
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
