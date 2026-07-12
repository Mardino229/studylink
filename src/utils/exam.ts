import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate";
import { useUser } from "../components/layout/userContext";
import type { Course, ExamFilters, ExamItem, SolutionSubmission } from "../types/exams";

const err = (error: unknown) =>
    (error as AxiosError<{ detail: string }>).response?.data?.detail || "Une erreur est survenue";

// ─── Unlocked solutions (client-side, user-scoped) ─────────

export const unlockedKey = (userId?: string) => ["unlocked-solutions", userId ?? ""];

function storageKey(userId?: string) {
    return `unlocked_solutions_${userId ?? "anonymous"}`;
}

export const useGetUnlockedSolutions = () => {
    const { user } = useUser();
    return useQuery({
        queryKey: unlockedKey(user?.id),
        queryFn: (): string[] => {
            try {
                return JSON.parse(localStorage.getItem(storageKey(user?.id)) ?? "[]");
            } catch {
                return [];
            }
        },
        enabled: !!user?.id,
        staleTime: Infinity,
    });
};

export const useMarkSolutionUnlocked = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    return (examId: string) => {
        const key = unlockedKey(user?.id);
        const current = queryClient.getQueryData<string[]>(key) ?? [];
        if (current.includes(examId)) return;
        const updated = [...current, examId];
        localStorage.setItem(storageKey(user?.id), JSON.stringify(updated));
        queryClient.setQueryData(key, updated);
    };
};

export function clearUnlockedSolutions(userId?: string) {
    localStorage.removeItem(storageKey(userId));
}

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
            if (filters?.submission_status) params.set("submission_status", filters.submission_status);
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
            solution_file?: File;
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
            if (data.solution_file) formData.append("solution_file", data.solution_file);
            if (data.course_id) formData.append("course_id", data.course_id);
            if (data.program_id) formData.append("program_id", data.program_id);
            if (data.study_level_id) formData.append("study_level_id", data.study_level_id);
            if (data.academic_year) formData.append("academic_year", String(data.academic_year));
            if (data.session) formData.append("session", data.session);
            if (data.exam_type) formData.append("exam_type", data.exam_type);
            const response = await axiosPrivate.post<{ data: ExamItem }>("/exam-library", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exam-library"] });
            toast.success("Épreuve soumise ! Elle sera visible après validation.");
        },
        onError: (error) => {
            toast.error("Erreur lors de la soumission", { description: err(error) });
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
            queryClient.invalidateQueries({ queryKey: ["pending-exams"] });
            toast.success("Épreuve validée et publiée");
        },
        onError: (error) => {
            toast.error("Erreur lors de la validation", { description: err(error) });
        },
    });
};

export const useRejectExam = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ examId, admin_note }: { examId: string; admin_note: string }) => {
            const response = await axiosPrivate.post<{ data: ExamItem }>(`/exam-library/${examId}/reject`, { admin_note });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exam-library"] });
            queryClient.invalidateQueries({ queryKey: ["pending-exams"] });
            toast.success("Épreuve refusée");
        },
        onError: (error) => {
            toast.error("Erreur lors du refus", { description: err(error) });
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

// ─── User submissions ─────────────────────────────────────

export const useGetMySubmissions = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["my-exam-submissions"],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: ExamItem[] }>("/exam-library/my-submissions");
            return res.data.data;
        },
    });
};

export const useResubmitExam = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ examId, exam_file, ...data }: {
            examId: string;
            exam_file?: File;
            name?: string;
            course_id?: string;
            academic_year?: number;
            session?: string;
            exam_type?: string;
        }) => {
            const formData = new FormData();
            if (exam_file) formData.append("exam_file", exam_file);
            if (data.name) formData.append("name", data.name);
            if (data.course_id) formData.append("course_id", data.course_id);
            if (data.academic_year) formData.append("academic_year", String(data.academic_year));
            if (data.session) formData.append("session", data.session);
            if (data.exam_type) formData.append("exam_type", data.exam_type);
            const res = await axiosPrivate.put<{ data: ExamItem }>(`/exam-library/${examId}/resubmit`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-exam-submissions"] });
            toast.success("Épreuve re-soumise avec succès !");
        },
        onError: (error) => {
            toast.error("Erreur lors de la re-soumission", { description: err(error) });
        },
    });
};

export const useGetMissingSolutions = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["exams-missing-solution"],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: ExamItem[] }>("/exam-library/missing-solution");
            return res.data.data;
        },
    });
};

export const useSubmitSolution = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ examId, solution_file }: { examId: string; solution_file: File }) => {
            const formData = new FormData();
            formData.append("solution_file", solution_file);
            const res = await axiosPrivate.post<{ data: SolutionSubmission }>(`/exam-library/${examId}/solution/submit`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-solution-submissions"] });
            queryClient.invalidateQueries({ queryKey: ["exams-missing-solution"] });
            toast.success("Corrigé soumis ! Il sera visible après validation.");
        },
        onError: (error) => {
            toast.error("Erreur lors de la soumission", { description: err(error) });
        },
    });
};

export const useGetMySolutionSubmissions = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["my-solution-submissions"],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: SolutionSubmission[] }>("/exam-library/my-solution-submissions");
            return res.data.data;
        },
    });
};

export const useResubmitSolution = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ submissionId, solution_file }: { submissionId: string; solution_file: File }) => {
            const formData = new FormData();
            formData.append("solution_file", solution_file);
            const res = await axiosPrivate.put<{ data: SolutionSubmission }>(`/exam-library/solutions/${submissionId}/resubmit`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-solution-submissions"] });
            toast.success("Corrigé re-soumis avec succès !");
        },
        onError: (error) => {
            toast.error("Erreur lors de la re-soumission", { description: err(error) });
        },
    });
};

export const useDeleteMyExamSubmission = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (examId: string) => {
            await axiosPrivate.delete(`/exam-library/my-submissions/${examId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-exam-submissions"] });
            toast.success("Soumission supprimée.");
        },
        onError: (error) => {
            toast.error("Impossible de supprimer", { description: err(error) });
        },
    });
};

export const useDeleteMySolutionSubmission = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (submissionId: string) => {
            await axiosPrivate.delete(`/exam-library/solutions/my-submissions/${submissionId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-solution-submissions"] });
            toast.success("Soumission supprimée.");
        },
        onError: (error) => {
            toast.error("Impossible de supprimer", { description: err(error) });
        },
    });
};

// ─── Admin moderation ─────────────────────────────────────

export const useGetPendingExams = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["pending-exams"],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: ExamItem[] }>("/exam-library/admin/submissions/pending");
            return res.data.data;
        },
    });
};

export const useGetPendingSolutions = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["pending-solutions"],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: SolutionSubmission[] }>("/exam-library/admin/solutions/pending");
            return res.data.data;
        },
    });
};

export const useValidateSolution = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (submissionId: string) => {
            const res = await axiosPrivate.post<{ data: SolutionSubmission }>(`/exam-library/solutions/${submissionId}/validate`);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-solutions"] });
            queryClient.invalidateQueries({ queryKey: ["exam-library"] });
            toast.success("Corrigé validé et publié");
        },
        onError: (error) => {
            toast.error("Erreur lors de la validation", { description: err(error) });
        },
    });
};

export const useRejectSolution = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async ({ submissionId, admin_note }: { submissionId: string; admin_note: string }) => {
            const res = await axiosPrivate.post<{ data: SolutionSubmission }>(`/exam-library/solutions/${submissionId}/reject`, { admin_note });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-solutions"] });
            toast.success("Corrigé refusé");
        },
        onError: (error) => {
            toast.error("Erreur lors du refus", { description: err(error) });
        },
    });
};
