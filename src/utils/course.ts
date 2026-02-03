import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import type { AxiosError } from "axios";
import {useAxiosPrivate} from "../hoooks/useAxiosPrivate.ts";

export const courseSchema = z.object({
    course_name: z.string().min(1, "Title is required"),
    course_color: z.enum([
        "emerald", "teal", "orange", "blue", "green", "rose", "red", "amber", "indigo", "violet", "purple", "pink", "cyan", "sky", "lime", "zinc", "slate", "gray", "neutral", "stone", "yellow"
    ])
});

export type CourseFormRequest = z.infer<typeof courseSchema>;

export type Course = {
    id: string;
    course_name: string;
    course_color: "emerald" | "teal" | "orange" | "blue" | "green" | "rose" | "red" | "amber" | "indigo" | "violet" | "purple" | "pink" | "cyan" | "sky" | "lime" | "zinc" | "slate" | "gray" | "neutral" | "stone" | "yellow" | "fuchsia" | undefined;
    created_at?: string;
    updated_at?: string;
};

export const useGetCourses = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["courses"],
        queryFn: async () => {
            const response = await axiosPrivate.get<Course[]>("/courses");
            return response.data;
        },
    });
};

export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (data: CourseFormRequest) => {
            const response = await axiosPrivate.post("/courses", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast.success("Cours créé avec succès");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ detail: string }>;
            toast.error("Erreur lors de la création du cours", {
                description: axiosError.response?.data?.detail || "Une erreur est survenue",
            });
        },
    });
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: CourseFormRequest }) => {
            const response = await axiosPrivate.patch(`/courses/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast.success("Cours mis à jour avec succès");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ detail: string }>;
            toast.error("Erreur lors de la mise à jour du cours", {
                description: axiosError.response?.data?.detail || "Une erreur est survenue",
            });
        },
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (id: string) => {
            await axiosPrivate.delete(`/courses/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast.success("Cours supprimé avec succès");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ detail: string }>;
            toast.error("Erreur lors de la suppression du cours", {
                description: axiosError.response?.data?.detail || "Une erreur est survenue",
            });
        },
    });
};
