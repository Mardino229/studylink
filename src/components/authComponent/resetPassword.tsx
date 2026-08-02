import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button.tsx";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLong } from "@fortawesome/free-solid-svg-icons";
import { useRequestPassword } from "../../utils/auth.ts";
import { RotatingLines } from "react-loader-spinner";

export function ResetPassword() {
    const { t } = useTranslation('auth');
    const { t: tErr } = useTranslation('errors');
    const resetPasswordRequest = useRequestPassword();

    const resetSchema = z.object({
        email: z.email({ message: tErr('email.invalid') })
            .refine((v) => v.endsWith("@uottawa.ca"), { message: tErr('email.uottawa') })
    });

    const form = useForm({
        resolver: zodResolver(resetSchema),
        defaultValues: { email: "" }
    });

    const onSubmit = (data: { email: string }) => {
        resetPasswordRequest.mutate({ to_email: data.email });
        if (resetPasswordRequest.isSuccess) {
            form.reset();
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="font-medium hover:text-blue-700 hover:bg-transparent border-none p-0 shadow-none text-primary" variant="outline">
                    {t('reset.trigger_link')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-left">{t('reset.modal_title')}</DialogTitle>
                    <DialogDescription className="text-left">
                        {t('reset.modal_description')}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField name="email" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <input
                                        {...field}
                                        type="email"
                                        autoComplete="email"
                                        className="block w-full border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md border-gray-300 px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none"
                                        placeholder={t('reset.email_placeholder')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button
                                variant={resetPasswordRequest.isPending ? 'outline' : 'default'}
                                type="button"
                                onClick={form.handleSubmit(onSubmit)}
                                className="text-sm font-semibold"
                                disabled={resetPasswordRequest.isPending}
                            >
                                {resetPasswordRequest.isPending ? (
                                    <RotatingLines
                                        visible={true}
                                        strokeWidth="5"
                                        width="20"
                                        strokeColor="#135bec"
                                        animationDuration="0.75"
                                        ariaLabel="rotating-lines-loading"
                                    />
                                ) : (
                                    t('reset.submit')
                                )}
                                {!resetPasswordRequest.isPending && <FontAwesomeIcon icon={faRightLong} />}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
