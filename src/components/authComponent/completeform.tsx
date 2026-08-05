import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form.tsx";
import { Button } from "../ui/button.tsx";
import FormLayout from "../layout/formLayout.tsx";
import { Faculties, type Faculty, type Program, Programs, type StudyLevel, StudyLevels } from "../../utils/school.ts";
import type { CompleteProfileRequest } from "../../utils/type.ts";
import { useCompleteProfile } from "../../utils/user.ts";
import { RotatingLines } from "react-loader-spinner";
import { Input } from "../ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "../ui/select.tsx";
import { useTranslation } from "react-i18next";

type CompleteProfileFormData = CompleteProfileRequest & {
    program_name?: string;
};

export default function CompleteProfileForm() {
    const { t } = useTranslation('auth');
    const OTHER_VALUE = "other";

    const completeProfile = useCompleteProfile();
    const studyLevels = StudyLevels();
    const faculties = Faculties();
    const programs = Programs();

    const baseSchema = z.object({
        first_name: z.string().min(2, t('complete_profile.error_first_name')),
        last_name: z.string().min(2, t('complete_profile.error_last_name')),
        study_level_id: z.string().min(1, t('complete_profile.error_study_level')),
        faculty_id: z.string().optional(),
        program_id: z.string().optional(),
        program_name: z.string().optional(),
    }).superRefine((val, ctx) => {
        const currentIsGrad = studyLevels.data?.find((s: StudyLevel) => String(s.id) === String(val.study_level_id))
            ?.name?.toLowerCase().includes("études supérieures") ?? false;
        const otherSelected = val.program_id === OTHER_VALUE;

        if (currentIsGrad) {
            if (!val.program_name || val.program_name.trim().length < 2) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["program_name"], message: t('complete_profile.error_program_name_grad') });
            }
        } else {
            if (!val.faculty_id) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["faculty_id"], message: t('complete_profile.error_faculty') });
            }
            if (otherSelected) {
                if (!val.program_name || val.program_name.trim().length < 2) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["program_name"], message: t('complete_profile.error_program_name') });
                }
            } else {
                if (!val.program_id) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["program_id"], message: t('complete_profile.error_program') });
                }
            }
        }
    });

    const form = useForm({
        resolver: zodResolver(baseSchema),
        defaultValues: { first_name: "", last_name: "", study_level_id: "", faculty_id: "", program_id: "", program_name: "" },
    });

    if (studyLevels.isPending || faculties.isPending) {
        return (
            <div>
                <RotatingLines visible strokeWidth="5" width="20" strokeColor="#135bec" animationDuration="0.75" ariaLabel="rotating-lines-loading" />
            </div>
        );
    }

    const studyLevelId = form.watch("study_level_id");
    const facultyId = form.watch("faculty_id");
    const programId = form.watch("program_id");

    const selectedLevel = studyLevels.data?.find((s: StudyLevel) => String(s.id) === String(studyLevelId));
    const isGraduate = selectedLevel?.name?.toLowerCase().includes("études supérieures") ?? false;
    const programsByFaculty = facultyId ? programs.data?.filter((prog: Program) => prog.faculty_id === facultyId) : [];
    const useOtherProgram = isGraduate || programId === OTHER_VALUE;

    const onSubmit = (data: CompleteProfileFormData) => {
        const payload: CompleteProfileRequest = {
            first_name: data.first_name,
            last_name: data.last_name,
            study_level_id: data.study_level_id,
            other_program: (isGraduate || useOtherProgram || data.program_id === OTHER_VALUE) && data.program_name ? data.program_name : undefined,
            faculty_id: isGraduate ? undefined : data.faculty_id,
            program_id: (isGraduate || useOtherProgram || data.program_id === OTHER_VALUE) ? undefined : data.program_id,
        };
        completeProfile.mutate(payload);
    };

    const inputClass = "form-input block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm";

    return (
        <>
            <div className="cylinder1" />
            <div className="cylinder2" />
            <div className="cylinder3" />
            <div className="cylinder4" />
            <div className="relative z-10 w-full max-w-xl">
                <div className="rounded-2xl bg-white/50 dark:bg-white/5 bg-clip-padding backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-2xl ring-1 ring-black/5 p-6 sm:p-8">
                    <FormLayout title={t('complete_profile.title')} description={t('complete_profile.description')}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <FormField name="first_name" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('complete_profile.first_name')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} className={inputClass} placeholder={t('complete_profile.first_name_placeholder')} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="last_name" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('complete_profile.last_name')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} className={inputClass} placeholder={t('complete_profile.last_name_placeholder')} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField name="study_level_id" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('complete_profile.study_level')}</FormLabel>
                                        <FormControl>
                                            <Select {...field} onValueChange={(val) => {
                                                field.onChange(val);
                                                const selected = studyLevels.data?.find((s: StudyLevel) => String(s.id) === String(val));
                                                const grad = selected?.name?.toLowerCase().includes("études supérieures") ?? false;
                                                if (grad) {
                                                    form.setValue("faculty_id", "");
                                                    form.setValue("program_id", "");
                                                }
                                            }} value={field.value}>
                                                <SelectTrigger className="w-full overflow-hidden text-ellipsis whitespace-nowrap py-5 shadow-sm">
                                                    <SelectValue placeholder={t('complete_profile.select_placeholder')} />
                                                </SelectTrigger>
                                                <SelectContent className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                                    <SelectGroup>
                                                        <SelectLabel>{t('complete_profile.study_level')}</SelectLabel>
                                                        {studyLevels.data?.map((prog: StudyLevel) => (
                                                            <SelectItem className="w-full overflow-hidden text-ellipsis whitespace-nowrap" key={prog.id} value={String(prog.id)}>{prog.name}</SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                {!isGraduate && (
                                    <FormField name="faculty_id" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('complete_profile.faculty')}</FormLabel>
                                            <FormControl>
                                                <Select {...field} onValueChange={(val) => {
                                                    field.onChange(val);
                                                    form.setValue("program_id", "");
                                                }} value={field.value} disabled={faculties.isPending || !faculties.data?.length}>
                                                    <SelectTrigger className="w-full overflow-hidden text-ellipsis whitespace-nowrap py-5 shadow-sm">
                                                        <SelectValue placeholder={t('complete_profile.select_placeholder')} />
                                                    </SelectTrigger>
                                                    <SelectContent className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                                        {faculties.data?.map((fac: Faculty) => (
                                                            <SelectItem className="w-full overflow-hidden text-ellipsis whitespace-nowrap" key={fac.id} value={String(fac.id)}>{fac.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                                {!isGraduate && (
                                    <FormField name="program_id" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('complete_profile.program')}</FormLabel>
                                            <FormControl>
                                                <Select {...field} onValueChange={(val) => {
                                                    field.onChange(val);
                                                    if (val !== OTHER_VALUE) form.setValue("program_name", "");
                                                }} value={field.value} disabled={programs.isPending || !programsByFaculty?.length}>
                                                    <SelectTrigger className="w-full overflow-hidden text-ellipsis whitespace-nowrap py-5 shadow-sm">
                                                        <SelectValue placeholder={t('complete_profile.select_placeholder')} />
                                                    </SelectTrigger>
                                                    <SelectContent className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                                        {programsByFaculty?.map((prog: Program) => (
                                                            <SelectItem className="w-full overflow-hidden text-ellipsis whitespace-nowrap" key={prog.id} value={String(prog.id)}>{prog.name}</SelectItem>
                                                        ))}
                                                        <SelectItem className="w-full overflow-hidden text-ellipsis whitespace-nowrap" value={OTHER_VALUE}>{t('complete_profile.others')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                                {(isGraduate || useOtherProgram) && (
                                    <FormField name="program_name" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('complete_profile.program_name')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} className={inputClass} placeholder={t('complete_profile.program_name_placeholder')} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                                <Button variant={completeProfile.isPending ? 'outline' : 'default'} type="submit" className="w-full h-11 text-sm font-semibold" disabled={completeProfile.isPending}>
                                    {completeProfile.isPending ? (
                                        <span className="inline-flex items-center gap-2">
                                            <RotatingLines visible strokeWidth="5" width="18" strokeColor="#135bec" animationDuration="0.75" ariaLabel="rotating-lines-loading" />
                                            {t('complete_profile.submitting')}
                                        </span>
                                    ) : t('complete_profile.submit')}
                                </Button>
                            </form>
                        </Form>
                    </FormLayout>
                </div>
            </div>
        </>
    );
}
