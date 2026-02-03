import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosPrivate } from "./api.ts";
import { toast } from "sonner";
import { z } from "zod";
import type { AxiosError } from "axios";

export const summarySchema = z.object({
    title: z.string().min(1, "Title is required"),
    course_id: z.string().min(1, "Course ID is required"),
});

export type Summary = {
    id: string;
    summary_name: string;
    course_id: string;
    file_url?: string;
    type?: string;
    created_at?: string;
    updated_at?: string;
};

export const useGetSummaries = (courseId?: string) => {
    return useQuery({
        queryKey: ["summaries", courseId],
        queryFn: async () => {
            if (!courseId) return [];
            const response = await axiosPrivate.get<Summary[]>(`/summaries/course/${courseId}`);
            return response.data;
        },
        enabled: !!courseId,
    });
};

export const useCreateSummary = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ title, courseId, file }: { title: string; courseId: string; file: File }) => {
            const formData = new FormData();
            formData.append("summary_name", title);
            formData.append("course_id", courseId);
            formData.append("document", file);

            const response = await axiosPrivate.post("/summaries", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["summaries", variables.courseId] });
            toast.success("Résumé créé avec succès");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ detail: string }>;
            toast.error("Erreur lors de la création du résumé", {
                description: axiosError.response?.data?.detail || "Une erreur est survenue",
            });
        },
    });
};

export const useUpdateSummary = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, summary_name }: { id: string; summary_name: string }) => {
            const response = await axiosPrivate.patch(`/summaries/${id}`, { summary_name });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["summaries"] }).then(() => {
                toast.success("Résumé mis à jour avec succès");
            });
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ detail: string }>;
            toast.error("Erreur lors de la mise à jour du résumé", {
                description: axiosError.response?.data?.detail || "Une erreur est survenue",
            });
        },
    });
};

export const useDeleteSummary = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await axiosPrivate.delete(`/summaries/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["summaries"] });
            toast.success("Résumé supprimé avec succès");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ detail: string }>;
            toast.error("Erreur lors de la suppression du résumé", {
                description: axiosError.response?.data?.detail || "Une erreur est survenue",
            });
        },
    });
};
