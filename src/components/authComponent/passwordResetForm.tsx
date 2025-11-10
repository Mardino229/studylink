

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Button } from "../ui/button.tsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {Link, useLocation} from "react-router-dom";
import {useResetPassword} from "../../utils/auth.ts";
import {RotatingLines} from "react-loader-spinner";
import FormLayout from "../layout/formLayout.tsx";

const resetSchema = z.object({
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain a lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain a number" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain a special character" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export default function PasswordResetForm() {
    const location = useLocation();
    const resetPassword = useResetPassword();
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    const form = useForm({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = (data: { password: string; confirmPassword: string }) => {
        resetPassword.mutate({...data, token: token})
    };

    return (
        <FormLayout title="Reset your password" description="Enter a new password for reset your password.">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField name="password" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <input
                                    {...field}
                                    type="password"
                                    autoComplete="new-password"
                                    className="block w-full border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md border-gray-300 px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none"
                                    placeholder="••••••••"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="confirmPassword" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <input
                                    {...field}
                                    type="password"
                                    autoComplete="new-password"
                                    className="block w-full border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md border-gray-300 px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none"
                                    placeholder="••••••••"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button variant={resetPassword.isPending?'outline':'default'} type="submit" className="text-sm font-semibold" disabled={resetPassword.isPending}>
                        {resetPassword.isPending ? <RotatingLines
                            visible={true}
                            strokeWidth="5"
                            width="20"
                            strokeColor="#135bec"
                            animationDuration="0.75"
                            ariaLabel="rotating-lines-loading"
                        /> : "Reset Password"}
                    </Button>
                </form>
            </Form>
            <p className="text-center text-sm text-gray-600">
                Remembered your password?
                <Link className="font-medium text-[var(--primary-color)] hover:text-blue-700" to="/login">Log in</Link>
            </p>
        </FormLayout>
    );
}