
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form.tsx";
import { Button } from "../ui/button.tsx";
import FormLayout from "../layout/formLayout.tsx";
import {Faculties, type Faculty, type Program, Programs, type StudyLevel, StudyLevels} from "../../utils/school.ts";
import type {CompleteProfileRequest} from "../../utils/type.ts";
import {useCompleteProfile} from "../../utils/user.ts";
import {RotatingLines} from "react-loader-spinner";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "../ui/select.tsx";

type CompleteProfileFormData = CompleteProfileRequest & {
    program_name?: string;
};

export default function CompleteProfileForm() {
    // const [studyLevels, setstudyLevels] = useState([]);
    // const [faculties, setFaculties] = useState([]);
    const [programsByFaculty, setProgramsByFaculty] = useState<Program[]|undefined>([]);
    const [isGraduate, setIsGraduate] = useState(false);
    const [useOtherProgram, setUseOtherProgram] = useState(false);
    const OTHER_VALUE = "other";

    const baseSchema = z.object({
        first_name: z.string().min(2, "Prénom requis"),
        last_name: z.string().min(2, "Nom requis"),
        study_level_id: z.string().min(1, "Sélectionnez un programme d'étude"),
        faculty_id: z.string().optional(),
        program_id: z.string().optional(),
        program_name: z.string().optional(),
    }).superRefine((val, ctx) => {
        // Validation conditionnelle selon le niveau d'étude et l'option "Autres"
        // const studyLevelId = val.study_level_id;
        // La détection graduate se fait plus bas via effet; ici on valide à partir des champs visibles:
        const isGrad = (isGraduate);
        const otherSelected = val.program_id === OTHER_VALUE || useOtherProgram;

        if (isGrad) {
            if (!val.program_name || val.program_name.trim().length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["program_name"],
                    message: "Renseignez votre programme",
                });
            }
        } else {
            // Premier cycle
            if (!val.faculty_id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["faculty_id"],
                    message: "Sélectionnez une faculté",
                });
            }
            if (otherSelected) {
                if (!val.program_name || val.program_name.trim().length < 2) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["program_name"],
                        message: "Entrez le nom du programme",
                    });
                }
            } else {
                if (!val.program_id) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["program_id"],
                        message: "Sélectionnez un programme",
                    });
                }
            }
        }
    });

    const form = useForm({
        resolver: zodResolver(baseSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            study_level_id: "",
            faculty_id: "",
            program_id: "",
            program_name: "",
        },
    });

    const completeProfile = useCompleteProfile()
    const studyLevels = StudyLevels()
    const faculties = Faculties()
    const programs = Programs()

    // Récupérer les programmes selon la faculté
    useEffect(() => {
        const faculty = form.watch("faculty_id");
        if (faculty) {

            setProgramsByFaculty(programs.data?.filter(prog=>{
                return prog.faculty_id === parseInt(faculty)
            }))
        }
    }, [form, programs.data]);

    // Déterminer si le niveau sélectionné est "Études supérieures"
    useEffect(() => {
        const levelId = form.watch("study_level_id");
        if (!levelId || !studyLevels.data) return;
        const selected = studyLevels.data.find((s: StudyLevel) => String(s.id) === String(levelId));
        const grad = selected?.name?.toLowerCase().includes("études supérieures") ?? false;
        setIsGraduate(!!grad);
        // Reset champs dépendants
        if (grad) {
            form.setValue("faculty_id", "");
            form.setValue("program_id", "");
            setUseOtherProgram(true); // impose saisie libre
        } else {
            setUseOtherProgram(false);
        }
    }, [form.watch("study_level_id"), studyLevels.data]);

    // Sur changement du programme, activer champ "Autres" si choisi
    useEffect(() => {
        const pid = form.watch("program_id");
        if (pid === OTHER_VALUE) {
            setUseOtherProgram(true);
        } else {
            setUseOtherProgram(false);
            // Vider le nom libre si on revient sur une sélection
            form.setValue("program_name", form.getValues("program_name"));
        }
    }, [form]);

    if (studyLevels.isPending || faculties.isPending) {
        return (
            <div>
                <RotatingLines
                    visible={true}
                    strokeWidth="5"
                    width="20"
                    strokeColor="#135bec"
                    animationDuration="0.75"
                    ariaLabel="rotating-lines-loading"
                />
            </div>
        )
    }


    const onSubmit = (data: CompleteProfileFormData) => {
        const payload: CompleteProfileRequest = {
            first_name: data.first_name,
            last_name: data.last_name,
            study_level_id: data.study_level_id,
            other_program: (isGraduate || useOtherProgram || data.program_id === OTHER_VALUE) && data.program_name ? data.program_name : undefined,
            faculty_id: isGraduate ? undefined : data.faculty_id,
            program_id: (isGraduate || useOtherProgram || data.program_id === OTHER_VALUE) ? undefined : data.program_id,
        };
        completeProfile.mutate(payload)
    };

    return (
        <FormLayout title="Complétez votre profil" description="Dernière étape pour finaliser votre compte.">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField name="first_name" control={form.control} render={({field}) => (
                            <FormItem>
                                <FormLabel>Prénom</FormLabel>
                                <FormControl>
                                    <input {...field}
                                           className="block w-full border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md border-gray-300 px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none"
                                           placeholder="Votre prénom"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <FormField name="last_name" control={form.control} render={({field}) => (
                            <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl>
                                    <input {...field}
                                           className="block w-full border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md border-gray-300 px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none"
                                           placeholder="Votre nom"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                    </div>
                        <FormField name="study_level_id" control={form.control} render={({field}) => (
                            <FormItem>
                                <FormLabel>Programme d'étude</FormLabel>
                                <FormControl>
                                    <Select {...field} onValueChange={(val)=>{ field.onChange(val); }} value={field.value}>
                                        <SelectTrigger className="w-full overflow-hidden text-ellipsis whitespace-nowrap py-5 shadow-sm">
                                            <SelectValue placeholder="Sélectionnez..." />
                                        </SelectTrigger>
                                        <SelectContent className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                            <SelectGroup>
                                                <SelectLabel>Programme d'étude</SelectLabel>
                                                {studyLevels.data?.map((prog: StudyLevel) => (
                                                    <SelectItem className="w-full overflow-hidden text-ellipsis whitespace-nowrap" key={prog.id} value={String(prog.id)}>{prog.name}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        {!isGraduate && (
                        <FormField name="faculty_id" control={form.control} render={({field}) => (
                            <FormItem>
                                <FormLabel>Faculté</FormLabel>
                                <FormControl>
                                    <Select {...field} onValueChange={field.onChange} value={field.value} disabled={faculties.isPending || !faculties.data?.length}>
                                        <SelectTrigger className="w-full overflow-hidden text-ellipsis whitespace-nowrap py-5 shadow-sm">
                                            <SelectValue placeholder="Sélectionnez..." />
                                        </SelectTrigger>
                                        <SelectContent className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                            {faculties.data?.map((fac: Faculty) => (
                                                <SelectItem className="w-full overflow-hidden text-ellipsis whitespace-nowrap" key={fac.id} value={String(fac.id)}>{fac.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        )}
                        {!isGraduate && (
                        <FormField name="program_id" control={form.control} render={({field}) => (
                            <FormItem>
                                <FormLabel>Programme</FormLabel>
                                <FormControl>
                                    <Select {...field} onValueChange={(val)=>{ field.onChange(val); }} value={field.value} disabled={programs.isPending || !programsByFaculty?.length}>
                                        <SelectTrigger className="w-full overflow-hidden text-ellipsis whitespace-nowrap py-5 shadow-sm">
                                            <SelectValue placeholder="Sélectionnez..." />
                                        </SelectTrigger>
                                        <SelectContent className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                            {programsByFaculty?.map((prog: Program) => (
                                                <SelectItem className="w-full overflow-hidden text-ellipsis whitespace-nowrap" key={prog.id} value={String(prog.id)}>{prog.name}</SelectItem>
                                            ))}
                                            <SelectItem className="w-full overflow-hidden text-ellipsis whitespace-nowrap" value={OTHER_VALUE}>Autres</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        )}
                        {(isGraduate || useOtherProgram) && (
                            <FormField name="program_name" control={form.control} render={({field}) => (
                                <FormItem>
                                    <FormLabel>Nom du programme</FormLabel>
                                    <FormControl>
                                        <input {...field}
                                               className="block w-full border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md border-gray-300 px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none"
                                               placeholder="Ex: B.Sc. Informatique"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                        )}
                        <Button variant={completeProfile.isPending?'outline':'default'} type="submit" className="text-sm font-semibold" disabled={completeProfile.isPending}>
                            {completeProfile.isPending ?
                            <RotatingLines
                                visible={true}
                                strokeWidth="5"
                                width="20"
                                strokeColor="#135bec"
                                animationDuration="0.75"
                                ariaLabel="rotating-lines-loading"
                            /> : "Finaliser"}
                        </Button>
                </form>
            </Form>
        </FormLayout>
    )
}