import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form.tsx";
import {Button} from "../ui/button.tsx";
import {useLogin} from "../../utils/auth.ts";
import {RotatingLines} from "react-loader-spinner";
import {ResetPassword} from "./resetPassword.tsx";
import FormLayout from "../layout/formLayout.tsx";
import type {LoginFormRequest} from "../../utils/type.ts";
import {Input} from "../ui/input.tsx";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";


const loginSchema = z.object({
    email: z.email({ message: "Invalid email address" }).nonempty("Email is required"),
    password: z.string()
});

export default function LoginForm() {
    const login = useLogin();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" }
    });

    const onSubmit = (data: LoginFormRequest) => {
        // handle login
        login.mutate(data)
        console.log(data);
    };

    return (
        <>
        <div className="cylinder1"></div>
        <div className="cylinder2"></div>
        <div className="cylinder3"></div>
        <div className="cylinder4"></div>
        <div className="relative z-10 w-full max-w-xl">
            <div className="rounded-2xl bg-white/50 dark:bg-white/5 bg-clip-padding backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-2xl ring-1 ring-black/5 p-6 sm:p-8">
                <FormLayout title="Sign in" description="Welcome back! Please enter your details.">
                    <Form {...form} >
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField name="email" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email address</FormLabel>
                                <FormControl>
                                    <Input {...field} type="email" autoComplete="email" aria-invalid={!!form.formState.errors.email}
                                           placeholder="email@uottawa.com"
                                           className="
                                           form-input block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm
                                    focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm"
                                           id="email"  />
                                </FormControl>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use your institutional email address.</p>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="password" control={form.control} render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Password</FormLabel>
                                    <div className="text-sm">
                                        {/*<a className="font-medium text-[var(--primary-color)] hover:text-blue-700" href="#">Forgot your password?</a>*/}
                                        <ResetPassword />
                                    </div>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            aria-invalid={!!form.formState.errors.password}
                                            className="form-input block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 pr-10 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm"
        
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute inset-y-0 right-2 my-auto h-7 w-7 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                                        >
                                            {showPassword ? 
                                                <FontAwesomeIcon icon={faEyeSlash} /> :
                                                <FontAwesomeIcon icon={faEye} />
                                            }
                                        </button>
                                    </div>
                                </FormControl>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Make sure your password is at least 8 characters.</p>
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
                                Remember me
                            </label>
                        </div>
                    </div>
                    <div>
                        <Button
                            variant={login.isPending ? 'outline' : 'default'}
                            type="submit"
                            className="w-full h-11 text-sm font-semibold"
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
                                    Logging in...
                                </span>
                            ) : (
                                "Log In"
                            )}
                        </Button>
                    </div>
                </form>
                    </Form>
            {/*<div className="relative">*/}
            {/*    <div className="absolute inset-0 flex items-center">*/}
            {/*        <div className="w-full border-t border-gray-300"></div>*/}
            {/*    </div>*/}
            {/*    <div className="relative flex justify-center text-sm">*/}
            {/*        <span className="bg-white px-2 text-gray-500">Or continue with</span>*/}
            {/*    </div>*/}
            {/*</div>*/}
            {/*<div className="grid grid-cols-2 gap-4">*/}
            {/*    <Button className="inline-flex cursor-pointer w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"*/}
            {/*      >*/}
            {/*        <FontAwesomeIcon icon={faGoogle} />*/}
            {/*        <span>Google</span>*/}
            {/*    </Button>*/}
            {/*    <Button className="inline-flex cursor-pointer w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"*/}
            {/*       >*/}
            {/*        <FontAwesomeIcon icon={faApple} />*/}
            {/*        <span>Apple</span>*/}
            {/*    </Button>*/}
            {/*</div>*/}
                    <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                Don't have an account?
                <Link className="font-semibold text-[var(--primary-color)] hover:text-blue-700" to="/register">Sign up</Link>
                    </p>
                </FormLayout>
            </div>
        </div>
        </>
    );
}