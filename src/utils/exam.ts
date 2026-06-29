import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate";
import type { Course, ExamFilters, ExamItem } from "../types/exams";

const err = (error: unknown) =>
    (error as AxiosError<{ detail: string }>).response?.data?.detail || "Une erreur est survenue";

// ─── Courses ──────────────────────────────────────────────

export const useGetCourses = (filters?: { faculty_id?: string }) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["exam-courses", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.faculty_id) params.set("faculty_id", filters.faculty_id);
            const response = await axiosPrivate.get<{ data: Course[] }>(`/exam-library/courses?${params}`);
            return response.data.data;
        },
    });
};

export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (data: { code: string; name: string; faculty_id?: string }) => {
            const response = await axiosPrivate.post<{ data: Course }>("/exam-library/courses", data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exam-courses"] });
            toast.success("Cours créé avec succès");
        },
        onError: (error) => {
            toast.error("Erreur de création", { description: err(error) });
        },
    });
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ courseId, ...data }: { courseId: string; code?: string; name?: string; faculty_id?: string }) => {
            const response = await axiosPrivate.patch<{ data: Course }>(`/exam-library/courses/${courseId}`, data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exam-courses"] });
            toast.success("Cours mis à jour");
        },
        onError: (error) => {
            toast.error("Erreur de mise à jour", { description: err(error) });
        },
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (courseId: string) => {
            await axiosPrivate.delete(`/exam-library/courses/${courseId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exam-courses"] });
            toast.success("Cours supprimé");
        },
        onError: (error) => {
            toast.error("Erreur de suppression", { description: err(error) });
        },
    });
};

// ─── Exams ────────────────────────────────────────────────

export const useGetExams = (filters?: ExamFilters) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["exam-library", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.faculty_id) params.set("faculty_id", filters.faculty_id);
            if (filters?.program_id) params.set("program_id", filters.program_id);
            if (filters?.course_id) params.set("course_id", filters.course_id);
            if (filters?.study_level_id) params.set("study_level_id", filters.study_level_id);
            if (filters?.academic_year) params.set("academic_year", String(filters.academic_year));
            if (filters?.session) params.set("session", filters.session);
            if (filters?.exam_type) params.set("exam_type", filters.exam_type);
            if (filters?.is_validated !== undefined) params.set("is_validated", String(filters.is_validated));
            if (filters?.skip !== undefined) params.set("skip", String(filters.skip));
            if (filters?.limit !== undefined) params.set("limit", String(filters.limit));
            const response = await axiosPrivate.get<{ data: ExamItem[] }>(`/exam-library?${params}`);
            return response.data.data;
        },
    });
};

export const useUploadExam = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (data: {
            name: string;
            exam_file: File;
            course_id?: string;
            program_id?: string;
            study_level_id?: string;
            academic_year?: number;
            session?: string;
            exam_type?: string;
            is_solution_paid?: boolean;
        }) => {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("exam_file", data.exam_file);
            if (data.course_id) formData.append("course_id", data.course_id);
            if (data.program_id) formData.append("program_id", data.program_id);
            if (data.study_level_id) formData.append("study_level_id", data.study_level_id);
            if (data.academic_year) formData.append("academic_year", String(data.academic_year));
            if (data.session) formData.append("session", data.session);
            if (data.exam_type) formData.append("exam_type", data.exam_type);
            if (data.is_solution_paid !== undefined) formData.append("is_solution_paid", String(data.is_solution_paid));
            const response = await axiosPrivate.post<{ data: ExamItem }>("/exam-library", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exam-library"] });
            toast.success("Épreuve uploadée avec succès");
        },
        onError: (error) => {
            toast.error("Erreur lors de l'upload", { description: err(error) });
        },
    });
};

export const useUploadSolution = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ examId, solution_file }: { examId: string; solution_file: File }) => {
            const formData = new FormData();
            formData.append("solution_file", solution_file);
            const response = await axiosPrivate.post<{ data: ExamItem }>(`/exam-library/${examId}/solution`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exam-library"] });
            toast.success("Corrigé uploadé avec succès");
        },
        onError: (error) => {
            toast.error("Erreur lors de l'upload du corrigé", { description: err(error) });
        },
    });
};

export const useValidateExam = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (examId: string) => {
            const response = await axiosPrivate.post<{ data: ExamItem }>(`/exam-library/${examId}/validate`);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exam-library"] });
            toast.success("Épreuve validée et publiée");
        },
        onError: (error) => {
            toast.error("Erreur lors de la validation", { description: err(error) });
        },
    });
};

export const useUpdateExam = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ examId, ...data }: {
            examId: string;
            name?: string;
            academic_year?: number;
            session?: string;
            exam_type?: string;
            is_solution_paid?: boolean;
            is_validated?: boolean;
        }) => {
            const response = await axiosPrivate.patch<{ data: ExamItem }>(`/exam-library/${examId}`, data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exam-library"] });
            toast.success("Épreuve mise à jour");
        },
        onError: (error) => {
            toast.error("Erreur de mise à jour", { description: err(error) });
        },
    });
};

export const useDeleteExam = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (examId: string) => {
            await axiosPrivate.delete(`/exam-library/${examId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exam-library"] });
            toast.success("Épreuve supprimée");
        },
        onError: (error) => {
            toast.error("Erreur de suppression", { description: err(error) });
        },
    });
};
