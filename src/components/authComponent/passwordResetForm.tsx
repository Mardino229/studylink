import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Button } from "../ui/button.tsx";
import { Input } from "../ui/input.tsx";
import { RotatingLines } from "react-loader-spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useResetPassword } from "../../utils/auth.ts";
import FormLayout from "../layout/formLayout.tsx";
import { useTranslation } from "react-i18next";

export default function PasswordResetForm() {
    const { t } = useTranslation('auth');
    const location = useLocation();
    const resetPassword = useResetPassword();
    const token = new URLSearchParams(location.search).get("token");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const resetSchema = z.object({
        password: z.string()
            .min(8, { message: t('reset_password.error_min') })
            .regex(/[A-Z]/, { message: t('reset_password.error_uppercase') })
            .regex(/[a-z]/, { message: t('reset_password.error_lowercase') })
            .regex(/[0-9]/, { message: t('reset_password.error_number') })
            .regex(/[^A-Za-z0-9]/, { message: t('reset_password.error_special') }),
        confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('reset_password.error_match'),
        path: ["confirmPassword"],
    });

    const form = useForm({
        resolver: zodResolver(resetSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    const onSubmit = (data: { password: string; confirmPassword: string }) => {
        resetPassword.mutate({ ...data, token });
    };

    return (
        <>
            <div className="cylinder1" />
            <div className="cylinder2" />
            <div className="cylinder3" />
            <div className="cylinder4" />
            <div className="relative z-10 w-full max-w-xl">
                <div className="rounded-2xl bg-white/50 dark:bg-white/5 bg-clip-padding backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-2xl ring-1 ring-black/5 p-6 sm:p-8">
                    <FormLayout title={t('reset_password.title')} description={t('reset_password.description')}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-4">
                                    <FormField name="password" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('reset_password.new_password')}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showPassword ? "text" : "password"}
                                                        autoComplete="new-password"
                                                        placeholder="••••••••"
                                                        className="form-input block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 pr-10 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(v => !v)}
                                                        aria-label={showPassword ? t('reset_password.hide_password') : t('reset_password.show_password')}
                                                        className="absolute inset-y-0 right-2 my-auto h-7 w-7 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                                                    >
                                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('reset_password.password_hint')}</p>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField name="confirmPassword" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('reset_password.confirm_password')}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showConfirm ? "text" : "password"}
                                                        autoComplete="new-password"
                                                        placeholder="••••••••"
                                                        className="form-input block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 pr-10 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirm(v => !v)}
                                                        aria-label={showConfirm ? t('reset_password.hide_password') : t('reset_password.show_password')}
                                                        className="absolute inset-y-0 right-2 my-auto h-7 w-7 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                                                    >
                                                        <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div>
                                    <Button
                                        variant={resetPassword.isPending ? "outline" : "default"}
                                        type="submit"
                                        className="w-full h-11 text-sm font-semibold"
                                        disabled={resetPassword.isPending}
                                    >
                                        {resetPassword.isPending ? (
                                            <span className="inline-flex items-center gap-2">
                                                <RotatingLines visible strokeWidth="5" width="18" strokeColor="#135bec" animationDuration="0.75" ariaLabel="rotating-lines-loading" />
                                                {t('reset_password.submitting')}
                                            </span>
                                        ) : t('reset_password.submit')}
                                    </Button>
                                </div>
                            </form>
                        </Form>

                        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                            {t('reset_password.remembered')}{" "}
                            <Link className="font-semibold text-[var(--primary-color)] hover:text-blue-700" to="/login">
                                {t('reset_password.login_link')}
                            </Link>
                        </p>
                    </FormLayout>
                </div>
            </div>
        </>
    );
}
