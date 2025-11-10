import { Form, FormControl, FormField, FormItem } from "../ui/form.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";

import {useLocation, useNavigate} from "react-router-dom";
import {useVerify} from "../../utils/auth.ts";
import FormLayout from "../layout/formLayout.tsx";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}
const codeSchema = z.object({
    code: z.array(z.string().length(1)).length(5),
});

type FormData = z.infer<typeof codeSchema>;

export default function ConfirmForm() {
    const query = useQuery();
    const email = query.get("email");
    const form = useForm<FormData>({
        resolver: zodResolver(codeSchema),
        defaultValues: { code: ["", "", "", "", ""] },
        mode: "onSubmit",
    });
    const navigate = useNavigate();
    const verify = useVerify()
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const [isCodeValid, setIsCodeValid] = useState<boolean | null>(null); // null=no validation yet, false=invalid, true=valid
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!email ) {
        navigate('/login');
    }

    // Focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, []);

    // Auto-submit when code is complete (length 5)
    useEffect(() => {
        let submitted = false;
        const subscription = form.watch((value) => {
            const codeArray = value.code;
            if (codeArray?.every((digit) => digit?.length === 1) && !isSubmitting && !submitted) {
                submitted = true;
                form.handleSubmit(onSubmit)();
            } else {
                setIsCodeValid(null); // Reset validation state if incomplete
            }
        });
        return () => subscription.unsubscribe();
    }, [form, isSubmitting]);

    async function onSubmit(data: FormData) {
        setIsSubmitting(true);
        setIsCodeValid(null);

        const code = data.code.join("");

        // Simuler une validation asynchrone (ex : appel API)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        verify.mutate({email: email, otp: code})

        setIsCodeValid(verify.isSuccess);
        setIsSubmitting(false);

        if (verify.isSuccess) {
            console.log("Code validé :", code);
            // Proceed with success flow
        } else {
            // console.log("Code invalide");
            // Optionnel : reset ou sélection du premier input
            inputRefs.current[4]?.blur();
        }
    }

    // Gestion changement input et focus suivant
    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;
        form.setValue(`code.${index}`, value);

        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Gestion backspace
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !form.getValues(`code.${index}`) && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Gestion collage
    const handlePaste = (e: React.ClipboardEvent<HTMLFormElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").slice(0, 5);
        if (!/^\d+$/.test(pasteData)) return;

        const pasteArray = pasteData.split("");
        pasteArray.forEach((digit, idx) => {
            form.setValue(`code.${idx}`, digit);
        });

        inputRefs.current[Math.min(pasteArray.length - 1, 4)]?.focus();
    };

    // Classe bordure selon état validation après soumission
    const getInputBorderClass = () => {
        if (isCodeValid === null) {
            return "border border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600";
        }
        return isCodeValid ? "border-2 border-green-500" : "border-2 border-red-500";
    };

    return (
        <FormLayout title="Confirm your account" description="We&apos;ve sent a 5 digit code to **********@uottawa.com">
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
                                            onFocus={(e) => {
                                                e.target.select();
                                                setFocusedIndex(index);
                                            }}
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
                <p className="text-red-500 text-center text-sm mt-1">Invalid code. Please try again.</p>
            )}
            <p className="text-center text-sm text-gray-600">
                Didn't receive a code?
                <button className="font-medium text-[var(--primary-color)] cursor-pointer hover:text-blue-700" >
                    Resent code
                </button>
            </p>
        </FormLayout>
    );
}
