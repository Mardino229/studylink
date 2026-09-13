import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form.tsx";
import { Button } from "../ui/button.tsx";
import { useLogin } from "../../utils/auth.ts";
import { RotatingLines } from "react-loader-spinner";
import { ResetPassword } from "./resetPassword.tsx";
import FormLayout from "../layout/formLayout.tsx";
import type { LoginFormRequest } from "../../utils/type.ts";
import { Input } from "../ui/input.tsx";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginForm() {
    const { t } = useTranslation('auth');
    const { t: tErr } = useTranslation('errors');
    const { t: tC } = useTranslation('common');
    const login = useLogin();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const loginSchema = z.object({
        email: z.email({ message: tErr('email.invalid') }).nonempty(tErr('email.required')),
        password: z.string()
    });

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" }
    });

    const onSubmit = (data: LoginFormRequest) => {
        login.mutate(data);
    };

    return (
        <>
        <div className="cylinder1"></div>
        <div className="cylinder2"></div>
        <div className="cylinder3"></div>
        <div className="cylinder4"></div>
        <div className="relative z-10 w-full max-w-xl">
            <div className="rounded-2xl bg-white/50 dark:bg-white/5 bg-clip-padding backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-2xl ring-1 ring-black/5 p-6 sm:p-8">
                <FormLayout title={t('login.title')} description={t('login.description')}>
                    <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField name="email" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>{tC('email')}</FormLabel>
                                <FormControl>
                                    <Input {...field} type="email" autoComplete="email" aria-invalid={!!form.formState.errors.email}
                                           placeholder={t('login.email_placeholder')}
                                           className="form-input block w-full appearance-none rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                                           id="email" />
                                </FormControl>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('login.email_hint')}</p>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="password" control={form.control} render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>{tC('password')}</FormLabel>
                                    <div className="text-sm">
                                        <ResetPassword />
                                    </div>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            placeholder={t('login.password_placeholder')}
                                            autoComplete="current-password"
                                            aria-invalid={!!form.formState.errors.password}
                                            className="form-input block w-full appearance-none rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 pr-10"
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? t('reset_password.hide_password') : t('reset_password.show_password')}
                                            className="absolute inset-y-0 right-2 my-auto h-7 w-7 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                                        >
                                            {showPassword ?
                                                <FontAwesomeIcon icon={faEyeSlash} /> :
                                                <FontAwesomeIcon icon={faEye} />
                                            }
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="flex items-center justify-between pt-2">
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 dark:border-white/30 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                {t('login.remember_me')}
                            </label>
                        </div>
                    </div>
                    <div>
                        <Button
                            variant={login.isPending ? 'outline' : 'default'}
                            type="submit"
                            className="w-full h-9 text-sm font-semibold"
                            disabled={login.isPending}
                            aria-busy={login.isPending}
                        >
                            {login.isPending ? (
                                <span className="inline-flex items-center gap-2">
                                    <RotatingLines
                                        visible={true}
                                        strokeWidth="5"
                                        width="18"
                                        strokeColor="#135bec"
                                        animationDuration="0.75"
                                        ariaLabel="rotating-lines-loading"
                                    />
                                    {t('login.submitting')}
                                </span>
                            ) : (
                                t('login.submit')
                            )}
                        </Button>
                    </div>
                </form>
                    </Form>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                        {t('login.no_account')}{" "}
                        <Link className="font-semibold text-[var(--primary-color)] hover:text-blue-700" to="/register">
                            {t('login.sign_up')}
                        </Link>
                    </p>
                </FormLayout>
            </div>
        </div>
        </>
    );
}
