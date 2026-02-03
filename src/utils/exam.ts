import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosPrivate } from "./api.ts";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { BankExamMeta } from "../types/exams";
import { z } from "zod";

export const examSchema = z.object({
    title: z.string()
        .min(1, "Le titre est requis")
        .regex(/^[a-zA-Z0-9\s]+(\s-\s|\s)[a-zA-Z0-9\s]+(\s-\s|\s)[a-zA-Z0-9\s]+$/, "Le nom doit respecter la nomenclature: Matière - Année - Type (ex: Physique - 2024 - Final)"),
    faculty: z.string().optional(),
    program: z.string().optional(),
    year: z.string().optional(),
    file: z.instanceof(File, { message: "Le fichier est requis" }).or(z.any().refine((val) => val instanceof FileList && val.length > 0, "Le fichier est requis")),
});

export type ExamFormValues = z.infer<typeof examSchema>;

export const useGetExams = () => {
    return useQuery({
        queryKey: ["exams"],
        queryFn: async () => {
            const response = await axiosPrivate.get<BankExamMeta[]>("/exams");
            return response.data;
        },
    });
};

export const useCreateExam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ title, faculty, program, year, file }: { title: string; faculty?: string; program?: string; year?: string; file: File }) => {
            const formData = new FormData();
            formData.append("title", title);
            if (faculty) formData.append("faculty", faculty);
            if (program) formData.append("program", program);
            if (year) formData.append("year", year);
            formData.append("file", file);

            const response = await axiosPrivate.post("/exams", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exams"] });
            toast.success("Examen uploadé avec succès");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ detail: string }>;
            toast.error("Erreur lors de l'upload de l'examen", {
                description: axiosError.response?.data?.detail || "Une erreur est survenue",
            });
        },
    });
};
