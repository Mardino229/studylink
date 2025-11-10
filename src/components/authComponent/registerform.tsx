
import {useState} from "react";
import {Link} from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form.tsx";
import {Button} from "../ui/button.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {RotatingLines} from "react-loader-spinner";
import {useRegister} from "../../utils/auth.ts";
import FormLayout from "../layout/formLayout.tsx";
import type {RegisterFormRequest} from "../../utils/type.ts";


export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const register = useRegister();

    const registerSchema = z.object({
        email: z.email({ message: "Invalid email address" })
            .regex(/^[\w.-]+@uottawa\.com$/, { message: "Email must be @uottawa.com" }),
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

    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = (data: RegisterFormRequest) => {
        register.mutate(data)
    };

    return (
        <>
        <div className="cylinder1"></div>
        <div className="cylinder2"></div>
        <div className="cylinder3"></div>
        <div className="cylinder4"></div>
        <div className="relative z-10 w-full max-w-xl">
            <div className="rounded-2xl bg-white/50 dark:bg-white/5 bg-clip-padding backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-2xl ring-1 ring-black/5 p-6 sm:p-8">
        <FormLayout title="Sign up" description="Please enter your email and a strong password.">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField name="email" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <input {...field} autoComplete="email"
                                       className="block w-full border-0 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/20 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md border-gray-300 px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none"
                                       id="email" type="email" placeholder="yourname@uottawa.com" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="password" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <input {...field} autoComplete="new-password"
                                           className="block w-full border-0 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/20 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md border-gray-300 px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none pr-10"
                                           id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" />
                                    <button type="button" tabIndex={-1} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100" onClick={() => setShowPassword(v => !v)}>
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="confirmPassword" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <input {...field} autoComplete="new-password"
                                           className="block w-full border-0 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/20 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md border-gray-300 px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none pr-10"
                                           id="confirm_password" type={showConfirm ? "text" : "password"} placeholder="••••••••" />
                                    <button type="button" tabIndex={-1} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100" onClick={() => setShowConfirm(v => !v)}>
                                        <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button variant={register.isPending?'outline':'default'} type="submit" className="text-sm font-semibold" disabled={register.isPending}>
                        {register.isPending ? <RotatingLines
                            visible={true}
                            strokeWidth="5"
                            width="20"
                            strokeColor="#135bec"
                            animationDuration="0.75"
                            ariaLabel="rotating-lines-loading"
                        /> : "Create My Account"}
                    </Button>
                </form>
            </Form>
            <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-300">
                Already have an account?
                <Link className="font-semibold leading-6 text-[var(--primary-color)] hover:text-indigo-500" to="/login">Log In</Link>
            </p>
        </FormLayout>
            </div>
        </div>
        </>
    );
}