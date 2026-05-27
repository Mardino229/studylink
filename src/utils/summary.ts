import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate.ts";

export type Flashcard = {
    id: string;
    summary_id: string;
    question: string;
    answer: string;
};

export type QuizQuestion = {
    type: "mcq" | "open";
    question: string;
    options?: string[];
    correct_answer?: string;
    answer?: string;
    explanation?: string;
};

export type Quiz = {
    quiz_name: string;
    id: string;
    questions: QuizQuestion[];
};

export type Summary = {
    id: string;
    summary_name: string;
    course_id: string;
    document_url?: string;
    content_markdown?: string;
    generation_date?: string;
    flashcards?: Flashcard[];
    quizzes?: Quiz[];
};

export const useGetSummaries = (courseId?: string) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["summaries", courseId],
        queryFn: async () => {
            if (!courseId) return [];
            const response = await axiosPrivate.get<{ data: Summary[] }>(`/summaries/course/${courseId}`);
            return response.data.data;
        },
        enabled: !!courseId,
    });
};

export const useGetSummary = (summaryId?: string | number) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["summary", summaryId],
        queryFn: async () => {
            if (!summaryId) return null;
            const response = await axiosPrivate.get<{ data: Summary }>(`/summaries/${summaryId}`);
            return response.data.data;
        },
        enabled: !!summaryId,
    });
};

export const useCreateSummary = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();

    return useMutation({
        mutationFn: async ({ title, courseId, file }: { title: string; courseId: string; file: File }) => {
            const formData = new FormData();
            formData.append("summary_name", title);
            formData.append("course_id", courseId);
            formData.append("document", file);
            console.log(formData)
            // 1. Déclenchement de la requête en mode stream
            const response = await axiosPrivate.post("/summaries", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                adapter: 'fetch', // Nécessaire pour Axios 1.7+ pour gérer le stream
                responseType: 'stream',
            });

            const reader = response.data.getReader();
            const decoder = new TextDecoder();
            const statusKey = ["summary-status", courseId];

            queryClient.setQueryData(statusKey, "upload");

            // ... dans ta mutationFn
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const messages = chunk.split("\n\n");

                messages.forEach((msg) => {
                    if (!msg.trim()) return;

                    const event = msg.match(/event: (.+)/)?.[1]?.trim();
                    const data = msg.match(/data: (.+)/)?.[1]?.trim();

                    if (event) {
                        if (event === "error") {
                            const errorDetails = JSON.parse(data || "{}");
                            // On récupère la dernière étape active avant l'erreur
                            const currentStatus = queryClient.getQueryData(statusKey) as { id: string, error: boolean } | string;
                            const lastId = typeof currentStatus === 'string' ? currentStatus : currentStatus?.id;

                            queryClient.setQueryData(statusKey, {
                                id: lastId,
                                error: true,
                                message: errorDetails.error || "Une erreur est survenue"
                            });

                            // On arrête tout proprement
                            throw new AxiosError(errorDetails.error);
                        }

                        queryClient.setQueryData(statusKey, (old: { id: string, error: boolean }) => {
                            let nextId = old?.id || "upload";
                            if (event === "status") {
                                if (data?.includes("résumé")) nextId = "summary";
                                else if (data?.includes("flashcards")) nextId = "flashcards";
                                else if (data?.includes("questions")) nextId = "quizzes";
                            }
                            else if (event === "summary") nextId = "flashcards";
                            else if (event === "flashcards") nextId = "quizzes";
                            else if (event === "quizzes") nextId = "complete";
                            else if (event === "complete") nextId = "complete";

                            return { id: nextId, error: false };
                        });
                    }
                });
            }
        },
        onSuccess: (_, variables) => {
            // Une fois fini, on rafraîchit la liste réelle
            queryClient.invalidateQueries({ queryKey: ["summaries", variables.courseId] });
            queryClient.removeQueries({ queryKey: ["summary-status", variables.courseId] });
            toast.success("Analyse complète terminée");
        },
        onError: (error, variables) => {
            queryClient.removeQueries({ queryKey: ["summary-status", variables.courseId] });
            const axiosError = error as AxiosError<{ detail: string, message: string }>;
            toast.error(axiosError.response?.data?.message || "Erreur lors de l'analyses");
        },
    });
};

export const useUpdateSummary = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ id, summary_name }: { id: string; summary_name: string }) => {
            const response = await axiosPrivate.patch<{ data: Summary }>(`/summaries/${id}`, { summary_name });
            return response.data.data;
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
    const axiosPrivate = useAxiosPrivate();
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
