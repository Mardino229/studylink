import { Form, FormControl, FormField, FormItem } from "../ui/form.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useVerify, useResendOtp } from "../../utils/auth.ts";
import FormLayout from "../layout/formLayout.tsx";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const codeSchema = z.object({
    code: z.array(z.string().length(1)).length(6),
});

type FormData = z.infer<typeof codeSchema>;

const COOLDOWN_SECONDS = 60;

export default function ConfirmForm() {
    const { t } = useTranslation('auth');
    const query = useQuery();
    const email = query.get("email");
    const navigate = useNavigate();
    const verify = useVerify();
    const resendOtp = useResendOtp();

    const form = useForm<FormData>({
        resolver: zodResolver(codeSchema),
        defaultValues: { code: ["", "", "", "", "", ""] },
        mode: "onSubmit",
    });

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const [isCodeValid, setIsCodeValid] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    if (!email) {
        navigate('/login');
    }

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    useEffect(() => {
        let submitted = false;
        const subscription = form.watch((value) => {
            const codeArray = value.code;
            if (codeArray?.every((digit) => digit?.length === 1) && !isSubmitting && !submitted) {
                submitted = true;
                form.handleSubmit(onSubmit)();
            } else {
                setIsCodeValid(null);
            }
        });
        return () => subscription.unsubscribe();
    }, [form, isSubmitting]);

    async function onSubmit(data: FormData) {
        setIsSubmitting(true);
        setIsCodeValid(null);
        const code = data.code.join("");
        verify.mutate({ email, otp: code });
        setIsCodeValid(verify.isSuccess);
        setIsSubmitting(false);
        if (!verify.isSuccess) {
            inputRefs.current[5]?.blur();
        }
    }

    function handleResend() {
        if (!email || cooldown > 0 || resendOtp.isPending) return;
        resendOtp.mutate(email, {
            onSuccess: (data) => {
                if (data.message !== "Account already activated") {
                    form.reset({ code: ["", "", "", "", "", ""] });
                    setIsCodeValid(null);
                    setCooldown(COOLDOWN_SECONDS);
                    setTimeout(() => inputRefs.current[0]?.focus(), 50);
                }
            },
        });
    }

    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;
        form.setValue(`code.${index}`, value);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !form.getValues(`code.${index}`) && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLFormElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pasteData)) return;
        pasteData.split("").forEach((digit, idx) => {
            form.setValue(`code.${idx}`, digit);
        });
        inputRefs.current[Math.min(pasteData.length - 1, 5)]?.focus();
    };

    const getInputBorderClass = () => {
        if (isCodeValid === null) {
            return "border border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600";
        }
        return isCodeValid ? "border-2 border-green-500" : "border-2 border-red-500";
    };

    const maskedEmail = email
        ? email.replace(/(.{2}).+(@.+)/, "$1•••$2")
        : "your email";

    return (
        <FormLayout
            title={t('confirm.title')}
            description={t('confirm.description', { email: maskedEmail })}
        >
            <Form {...form}>
                <form className="flex justify-center gap-2 sm:gap-3 mb-8" onPaste={handlePaste} autoComplete="off" noValidate>
                    {form.watch("code").map((_digit, index) => (
                        <FormField
                            key={index}
                            name={`code.${index}`}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <input
                                            {...field}
                                            ref={el => { inputRefs.current[index] = el; }}
                                            type="tel"
                                            maxLength={1}
                                            placeholder=""
                                            onChange={(e) => handleChange(e.target.value, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            onFocus={(e) => { e.target.select(); setFocusedIndex(index); }}
                                            onBlur={() => setFocusedIndex(-1)}
                                            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold bg-gray-50 dark:bg-[#0D1117] text-gray-900 dark:text-white rounded-lg outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 ${
                                                focusedIndex === index ? "border-2 border-blue-500" : getInputBorderClass()
                                            }`}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    ))}
                </form>
            </Form>

            {isCodeValid === false && (
                <p className="text-red-500 text-center text-sm mb-4">{t('confirm.invalid_code')}</p>
            )}

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {t('confirm.no_code')}{" "}
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || resendOtp.isPending}
                    className="font-semibold text-[var(--primary-color)] hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                    {resendOtp.isPending
                        ? t('confirm.resending')
                        : cooldown > 0
                        ? t('confirm.resend_cooldown', { seconds: cooldown })
                        : t('confirm.resend')}
                </button>
            </p>
        </FormLayout>
    );
}
