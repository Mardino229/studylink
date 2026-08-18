import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate.ts";
import type {
    Folder, Notebook, Source, Theme, ChatSession, ChatMessage,
    ArtefactQuiz, ArtefactFlashcard, ArtefactSummary, ArtefactPodcast, ArtefactMindmap,
    PaginatedResponse
} from "../types/workspace.ts";

type PaginationOptions = {
    page?: number;
    perPage?: number;
};

const buildPaginationParams = (options: PaginationOptions & Record<string, string | number | null | undefined> = {}) => {
    const params = new URLSearchParams();
    params.set("page", String(options.page ?? 1));
    params.set("per_page", String(options.perPage ?? 20));

    Object.entries(options).forEach(([key, value]) => {
        if (key === "page" || key === "perPage") return;
        if (value === undefined || value === null || value === "") return;
        params.set(key, String(value));
    });

    return params;
};

// ─── Folders ──────────────────────────────────────────────

export const useGetFolders = (options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["folders", options.page ?? 1, options.perPage ?? 20],
        queryFn: async () => {
            const params = buildPaginationParams(options);
            const response = await axiosPrivate.get<{ data: PaginatedResponse<Folder> }>(`/folders?${params}`);
            return response.data.data;
        },
    });
};

export const useCreateFolder = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (data: { name: string; description: string }) => {
            const response = await axiosPrivate.post<{ data: Folder }>("/folders", data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
            toast.success("Dossier créé avec succès");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur de création" });
        },
    });
};

export const useUpdateFolder = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { name: string; description: string } }) => {
            const response = await axiosPrivate.put<{ data: Folder }>(`/folders/${id}`, data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
            toast.success("Dossier mis à jour");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur de mise à jour" });
        },
    });
};

export const useDeleteFolder = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (id: string) => {
            await axiosPrivate.delete(`/folders/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
            toast.success("Dossier supprimé");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur de suppression" });
        },
    });
};

// ─── Notebooks ────────────────────────────────────────────

export const useGetNotebooks = (folderId?: string | null, options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["notebooks", folderId ?? "all", options.page ?? 1, options.perPage ?? 20],
        queryFn: async () => {
            const params = buildPaginationParams({ ...options, folder_id: folderId ?? undefined });
            const response = await axiosPrivate.get<{ data: PaginatedResponse<Notebook> }>(`/notebooks?${params}`);
            return response.data.data;
        },
    });
};

export const useGetUnassignedNotebooks = (options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["notebooks", "unassigned", options.page ?? 1, options.perPage ?? 20],
        queryFn: async () => {
            const params = buildPaginationParams(options);
            const response = await axiosPrivate.get<{ data: PaginatedResponse<Notebook> }>(`/notebooks/unassigned?${params}`);
            return response.data.data;
        },
    });
};

export const useGetFolderNotebooks = (folderId: string | null, options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["folder-notebooks", folderId, options.page ?? 1, options.perPage ?? 20],
        queryFn: async () => {
            if (!folderId) return { items: [], pagination: { total: 0, page: 1, per_page: 20, total_pages: 1 } };
            const params = buildPaginationParams(options);
            const response = await axiosPrivate.get<{ data: PaginatedResponse<Notebook> }>(`/folders/${folderId}/notebooks?${params}`);
            return response.data.data;
        },
        enabled: !!folderId,
    });
};

export const useGetNotebook = (notebookId?: string) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["notebook", notebookId],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ data: Notebook }>(`/notebooks/${notebookId}`);
            return response.data.data;
        },
        enabled: !!notebookId,
    });
};

export const useCreateNotebook = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (data: { name: string; description: string; folder_id: string | null }) => {
            const response = await axiosPrivate.post<{ data: Notebook }>("/notebooks", data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notebooks"] });
            queryClient.invalidateQueries({ queryKey: ["folder-notebooks"] });
            toast.success("Notebook créé avec succès");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur de création" });
        },
    });
};

export const useUpdateNotebook = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<{ name: string; description: string; folder_id: string | null }> }) => {
            const response = await axiosPrivate.patch<{ data: Notebook }>(`/notebooks/${id}`, data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notebooks"] });
            queryClient.invalidateQueries({ queryKey: ["notebook"] });
            queryClient.invalidateQueries({ queryKey: ["folder-notebooks"] });
            toast.success("Notebook mis à jour");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur de mise à jour" });
        },
    });
};

export const useDeleteNotebook = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (id: string) => {
            await axiosPrivate.delete(`/notebooks/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notebooks"] });
            queryClient.invalidateQueries({ queryKey: ["folder-notebooks"] });
            toast.success("Notebook supprimé");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur de suppression" });
        },
    });
};

// ─── Sources ──────────────────────────────────────────────

export const useGetSources = (notebookId: string, options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["sources", notebookId, options.page ?? 1, options.perPage ?? 20],
        queryFn: async () => {
            const params = buildPaginationParams(options);
            const response = await axiosPrivate.get<{ data: PaginatedResponse<Source> }>(`/notebooks/${notebookId}/sources?${params}`);
            return response.data.data;
        },
        enabled: !!notebookId,
    });
};

export const useUploadSource = () => {
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ notebookId, files }: { notebookId: string; files: File[] }) => {
            const formData = new FormData();
            for (const file of files) {
                formData.append("files", file);
            }
            const response = await axiosPrivate.post<{ data: Source[] }>(`/notebooks/${notebookId}/sources`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.data;
        },
        onSuccess: (data) => {
            const n = data.length;
            toast.success(`${n} source${n > 1 ? 's' : ''} ajoutée${n > 1 ? 's' : ''}`);
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur lors de l'upload" });
        },
    });
};

export const useAddYoutubeSource = () => {
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ notebookId, url }: { notebookId: string; url: string }) => {
            const response = await axiosPrivate.post<{ data: Source }>(`/notebooks/${notebookId}/sources/youtube`, { url });
            return response.data.data;
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ detail: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.detail || "URL YouTube invalide" });
        },
    });
};

export const useDeleteSource = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ notebookId, sourceId }: { notebookId: string; sourceId: string }) => {
            await axiosPrivate.delete(`/notebooks/${notebookId}/sources/${sourceId}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["sources", variables.notebookId] });
            queryClient.invalidateQueries({ queryKey: ["themes", variables.notebookId] });
            toast.success("Source supprimée");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur de suppression" });
        },
    });
};

// ─── Artefact deletions ──────────────────────────────────

export const useDeleteArtefactSummary = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ notebookId, summaryId }: { notebookId: string; summaryId: string }) => {
            await axiosPrivate.delete(`/notebooks/${notebookId}/artefacts/summaries/${summaryId}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["artefact-summaries", variables.notebookId] });
            toast.success("Résumé supprimé");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur de suppression" });
        },
    });
};

export const useDeleteArtefactFlashcard = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ notebookId, flashcardId }: { notebookId: string; flashcardId: string }) => {
            await axiosPrivate.delete(`/notebooks/${notebookId}/artefacts/flashcards/${flashcardId}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["artefact-flashcards", variables.notebookId] });
            toast.success("Flashcard supprimée");
        },  
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur de suppression" });
        },
    });
};

export const useDeleteArtefactQuiz = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ notebookId, quizId }: { notebookId: string; quizId: string }) => {
            await axiosPrivate.delete(`/notebooks/${notebookId}/artefacts/quizzes/${quizId}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["artefact-quizzes", variables.notebookId] });
            toast.success("Quiz supprimé");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur de suppression" });
        },
    });
};

export const useDeleteArtefactPodcast = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ notebookId, podcastId }: { notebookId: string; podcastId: string }) => {
            await axiosPrivate.delete(`/notebooks/${notebookId}/artefacts/podcasts/${podcastId}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["artefact-podcasts", variables.notebookId] });
            toast.success("Podcast supprimé");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur de suppression" });
        },
    });
};

// ─── Themes ───────────────────────────────────────────────

export const useGetThemes = (notebookId: string, options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["themes", notebookId, options.page ?? 1, options.perPage ?? 20],
        queryFn: async () => {
            const params = buildPaginationParams(options);
            const response = await axiosPrivate.get<{ data: PaginatedResponse<Theme> }>(`/notebooks/${notebookId}/themes?${params}`);
            return response.data.data;
        },
        enabled: !!notebookId,
    });
};

// ─── Chats ────────────────────────────────────────────────

export const useGetChatSessions = (notebookId: string, options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["chats", notebookId, options.page ?? 1, options.perPage ?? 20],
        queryFn: async () => {
            const params = buildPaginationParams(options);
            const response = await axiosPrivate.get<{ data: PaginatedResponse<ChatSession> }>(`/notebooks/${notebookId}/chats?${params}`);
            return response.data.data;
        },
        enabled: !!notebookId,
    });
};

export const useGetChatMessages = (notebookId: string, sessionId?: string | null, options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useInfiniteQuery({
        queryKey: ["chat-messages", notebookId, sessionId, options.perPage ?? 20],
        queryFn: async ({ pageParam = 1 }) => {
            const params = buildPaginationParams({ page: pageParam, perPage: options.perPage ?? 20 });
            const response = await axiosPrivate.get<{ data: PaginatedResponse<ChatMessage> }>(`/notebooks/${notebookId}/chats/${sessionId}/messages?${params}`);
            return response.data.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.page >= lastPage.pagination.total_pages) return undefined;
            return lastPage.pagination.page + 1;
        },
        enabled: !!notebookId && !!sessionId,
    });
};

export const useCreateChatSession = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ notebookId, title }: { notebookId: string; title: string }) => {
            const response = await axiosPrivate.post<{ data: { id: string } }>(`/notebooks/${notebookId}/chats`, { title });
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["chats", variables.notebookId] });
        },
    });
};

// ─── Artefacts ────────────────────────────────────────────

// Summaries
export const useGenerateSummary = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ notebookId, title, language, sourceIds, themeIds, customInstructions }: { notebookId: string; title: string; language?: string; sourceIds?: string[]; themeIds?: string[]; customInstructions?: string }) => {
            const response = await axiosPrivate.post<{ data: ArtefactSummary }>(`/notebooks/${notebookId}/artefacts/summaries`, {
                title,
                language,
                source_ids: sourceIds,
                theme_ids: themeIds,
                custom_instructions: customInstructions || undefined,
            });
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["artefact-summaries", variables.notebookId] });
            queryClient.invalidateQueries({ queryKey: ["token-balance"] });
            toast.success("Résumé généré");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur lors de la génération" });
        },
    });
};

export const useGetArtefactSummaries = (notebookId: string, options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["artefact-summaries", notebookId, options.page ?? 1, options.perPage ?? 20],
        queryFn: async () => {
            const params = buildPaginationParams(options);
            const response = await axiosPrivate.get<{ data: PaginatedResponse<ArtefactSummary> }>(`/notebooks/${notebookId}/artefacts/summaries?${params}`);
            return response.data.data;
        },
        enabled: !!notebookId,
    });
};

// Flashcards
export const useGenerateFlashcards = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ notebookId, title, language, count = 10, sourceIds, themeIds, customInstructions }: { notebookId: string; title: string; language?: string; count?: number; sourceIds?: string[]; themeIds?: string[]; customInstructions?: string }) => {
            const params = new URLSearchParams({ count: count.toString() });
            const response = await axiosPrivate.post<{ data: ArtefactFlashcard }>(`/notebooks/${notebookId}/artefacts/flashcards?${params}`, {
                title,
                language,
                source_ids: sourceIds,
                theme_ids: themeIds,
                custom_instructions: customInstructions || undefined,
            });
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["artefact-flashcards", variables.notebookId] });
            queryClient.invalidateQueries({ queryKey: ["token-balance"] });
            toast.success("Flashcards générées");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur lors de la génération" });
        },
    });
};

export const useGetArtefactFlashcards = (notebookId: string, options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["artefact-flashcards", notebookId, options.page ?? 1, options.perPage ?? 20],
        queryFn: async () => {
            const params = buildPaginationParams(options);
            const response = await axiosPrivate.get<{ data: PaginatedResponse<ArtefactFlashcard> }>(`/notebooks/${notebookId}/artefacts/flashcards?${params}`);
            return response.data.data;
        },
        enabled: !!notebookId,
    });
};

// Quizzes
export const useGenerateQuiz = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ notebookId, title, language, count = 5, sourceIds, themeIds, customInstructions }: { notebookId: string; title: string; language?: string; count?: number; sourceIds?: string[]; themeIds?: string[]; customInstructions?: string }) => {
            const params = new URLSearchParams({ count: count.toString() });
            const response = await axiosPrivate.post<{ data: ArtefactQuiz }>(`/notebooks/${notebookId}/artefacts/quizzes?${params}`, {
                title,
                language,
                source_ids: sourceIds,
                theme_ids: themeIds,
                custom_instructions: customInstructions || undefined,
            });
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["artefact-quizzes", variables.notebookId] });
            queryClient.invalidateQueries({ queryKey: ["token-balance"] });
            toast.success("Quiz généré");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur lors de la génération" });
        },
    });
};

export const useGetArtefactQuizzes = (notebookId: string, options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["artefact-quizzes", notebookId, options.page ?? 1, options.perPage ?? 20],
        queryFn: async () => {
            const params = buildPaginationParams(options);
            const response = await axiosPrivate.get<{ data: PaginatedResponse<ArtefactQuiz> }>(`/notebooks/${notebookId}/artefacts/quizzes?${params}`);
            return response.data.data;
        },
        enabled: !!notebookId,
    });
};

export const useGetArtefactQuiz = (notebookId: string, quizId?: string) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["artefact-quiz", notebookId, quizId],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ data: ArtefactQuiz }>(`/notebooks/${notebookId}/artefacts/quizzes/${quizId}`);
            return response.data.data;
        },
        enabled: !!notebookId && !!quizId,
    });
};

// Podcasts
export const useGeneratePodcast = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ notebookId, title, language, sourceIds, themeIds, customInstructions }: { notebookId: string; title: string; language?: string; sourceIds?: string[]; themeIds?: string[]; customInstructions?: string }) => {
            const response = await axiosPrivate.post<{ data: ArtefactPodcast }>(`/notebooks/${notebookId}/artefacts/podcasts`, {
                title,
                language,
                source_ids: sourceIds,
                theme_ids: themeIds,
                custom_instructions: customInstructions || undefined,
            });
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["artefact-podcasts", variables.notebookId] });
            queryClient.invalidateQueries({ queryKey: ["token-balance"] });
            toast.success("Podcast généré");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur lors de la génération" });
        },
    });
};

export const useGetArtefactPodcasts = (notebookId: string, options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["artefact-podcasts", notebookId, options.page ?? 1, options.perPage ?? 20],
        queryFn: async () => {
            const params = buildPaginationParams(options);
            const response = await axiosPrivate.get<{ data: PaginatedResponse<ArtefactPodcast> }>(`/notebooks/${notebookId}/artefacts/podcasts?${params}`);
            return response.data.data;
        },
        enabled: !!notebookId,
    });
};

// ─── Flashcard position & status ─────────────────────────

export const useUpdateFlashcardPosition = () => {
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ notebookId, flashcardId, currentIndex }: { notebookId: string; flashcardId: string; currentIndex: number }) => {
            const response = await axiosPrivate.patch<{ data: ArtefactFlashcard }>(
                `/notebooks/${notebookId}/artefacts/flashcards/${flashcardId}/position`,
                { current_index: currentIndex }
            );
            return response.data.data;
        },
    });
};

export const useSetFlashcardItemStatus = () => {
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ notebookId, flashcardId, itemIndex, status }: {
            notebookId: string;
            flashcardId: string;
            itemIndex: number;
            status: 'review_again' | null;
        }) => {
            const response = await axiosPrivate.patch<{ data: ArtefactFlashcard }>(
                `/notebooks/${notebookId}/artefacts/flashcards/${flashcardId}/items/${itemIndex}/status`,
                { status }
            );
            return response.data.data;
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ detail: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.detail || "Impossible de mettre à jour le statut" });
        },
    });
};

// ─── Mindmaps ─────────────────────────────────────────────

export const useGenerateMindmap = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ notebookId, title, language, maxDepth, sourceIds, themeIds, customInstructions }: {
            notebookId: string; title: string; language?: string; maxDepth?: number;
            sourceIds?: string[]; themeIds?: string[]; customInstructions?: string;
        }) => {
            const response = await axiosPrivate.post<{ data: ArtefactMindmap }>(`/notebooks/${notebookId}/artefacts/mindmaps`, {
                title,
                language,
                max_depth: maxDepth,
                source_ids: sourceIds,
                theme_ids: themeIds,
                custom_instructions: customInstructions || undefined,
            });
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["artefact-mindmaps", variables.notebookId] });
            queryClient.invalidateQueries({ queryKey: ["token-balance"] });
            toast.success("Carte mentale générée");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur lors de la génération" });
        },
    });
};

export const useGetArtefactMindmaps = (notebookId: string, options: PaginationOptions = {}) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["artefact-mindmaps", notebookId, options.page ?? 1, options.perPage ?? 20],
        queryFn: async () => {
            const params = buildPaginationParams(options);
            const response = await axiosPrivate.get<{ data: PaginatedResponse<ArtefactMindmap> }>(`/notebooks/${notebookId}/artefacts/mindmaps?${params}`);
            return response.data.data;
        },
        enabled: !!notebookId,
    });
};

export const useDeleteArtefactMindmap = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ notebookId, mindmapId }: { notebookId: string; mindmapId: string }) => {
            await axiosPrivate.delete(`/notebooks/${notebookId}/artefacts/mindmaps/${mindmapId}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["artefact-mindmaps", variables.notebookId] });
            toast.success("Carte mentale supprimée");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error("Erreur", { description: axiosError.response?.data?.message || "Erreur de suppression" });
        },
    });
};
