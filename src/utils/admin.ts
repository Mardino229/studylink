import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate.ts";
import type {
    AdminUsersResponse,
    SubscriptionPlan,
    SubscriptionPlanBilingual,
    PaginatedSubscriptions,
    SubscriptionPlanRequest,
    Announcement,
    AnnouncementRequest,
    AdminDashboardResponse
} from "./type.ts";

// --- Dashboard ---

export const useGetAdminDashboard = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["admin", "dashboard"],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ data: AdminDashboardResponse }>(
                `/admin/dashboard`
            );
            return response.data.data;
        },
    });
};

// --- Users ---

export const useGetAdminUsers = (skip: number = 0, limit: number = 100) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["admin", "users", skip, limit],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ data: AdminUsersResponse }>(
                `/admin/users?skip=${skip}&limit=${limit}`
            );
            return response.data.data;
        },
    });
};

// --- Plans ---

export const useGetAdminPlans = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["admin", "plans"],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ data: SubscriptionPlan[] }>(
                "/admin/subscription-plans"
            );
            return response.data.data;
        },
    });
};

export const useCreateAdminPlan = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: SubscriptionPlanRequest) => {
            const response = await axiosPrivate.post<{ message: string; data: SubscriptionPlan }>(
                "/admin/subscription-plans",
                data
            );
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
            toast.success(data.message || "Plan créé avec succès");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Erreur lors de la création du plan");
        }
    });
};

export const useDeleteAdminPlan = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string | string) => {
            const response = await axiosPrivate.delete<{ message: string }>(
                `/admin/subscription-plans/${id}`
            );
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
            toast.success(data.message || "Plan supprimé avec succès");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Erreur lors de la suppression du plan");
        }
    });
};

export const useUpdateAdminPlan = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string | string; data: Partial<SubscriptionPlanRequest> }) => {
            const response = await axiosPrivate.patch<{ message: string; data: SubscriptionPlan }>(
                `/admin/subscription-plans/${id}`,
                data
            );
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
            toast.success(data.message || "Plan mis à jour avec succès");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Erreur lors de la mise à jour du plan");
        }
    });
};

export const useGetAdminPlanBilingual = (planId: string | null) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["admin", "plans", planId, "bilingual"],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ data: SubscriptionPlanBilingual }>(
                `/admin/subscription-plans/${planId}/bilingual`
            );
            return response.data.data;
        },
        enabled: !!planId,
    });
};

// --- Token Packs (admin) ---

export const useCreateAdminTokenPack = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; tokens: number; price_cad: number }) => {
            const response = await axiosPrivate.post<{ data: unknown }>("/tokens/packs", data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["token-packs"] });
            toast.success("Pack créé avec succès");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Erreur lors de la création du pack");
        },
    });
};

export const useUpdateAdminTokenPack = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { name?: string; tokens?: number; price_cad?: number; is_active?: boolean } }) => {
            const response = await axiosPrivate.patch<{ data: unknown }>(`/tokens/packs/${id}`, data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["token-packs"] });
            toast.success("Pack mis à jour");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Erreur lors de la mise à jour");
        },
    });
};

export const useCreditUserTokens = () => {
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (data: { user_id: string; amount: number; description: string }) => {
            const response = await axiosPrivate.post<{ data: unknown }>("/tokens/admin/credit", data);
            return response.data.data;
        },
        onSuccess: () => {
            toast.success("Jetons crédités avec succès");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Erreur lors du crédit");
        },
    });
};

// --- Subscriptions ---

export const useGetAdminSubscriptions = (skip: number = 0, limit: number = 100) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["admin", "subscriptions", skip, limit],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ data: PaginatedSubscriptions }>(
                `/admin/subscriptions?skip=${skip}&limit=${limit}`
            );
            return response.data.data;
        },
    });
};

// --- Announcements & Surveys ---

export const useGetAdminAnnouncements = (type?: "announcement" | "survey", skip: number = 0, limit: number = 100) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["admin", "announcements", type, skip, limit],
        queryFn: async () => {
            const url = type
                ? `/admin/announcements-surveys?type=${type}&skip=${skip}&limit=${limit}`
                : `/admin/announcements-surveys?skip=${skip}&limit=${limit}`;
            const response = await axiosPrivate.get<{ data: Announcement[] }>(url);
            return response.data.data;
        },
    });
};

export const useCreateAdminAnnouncement = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: AnnouncementRequest) => {
            const response = await axiosPrivate.post<{ message: string; data: Announcement }>(
                "/admin/announcements-surveys",
                data
            );
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
            toast.success(data.message || "Élément créé avec succès");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Erreur lors de la création");
        }
    });
};

export const useUpdateAdminAnnouncement = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string | string; data: Partial<AnnouncementRequest> }) => {
            const response = await axiosPrivate.patch<{ message: string; data: Announcement }>(
                `/admin/announcements-surveys/${id}`,
                data
            );
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
            toast.success(data.message || "Élément mis à jour avec succès");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Erreur lors de la mise à jour");
        }
    });
};

export const useDeleteAdminAnnouncement = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string | string) => {
            const response = await axiosPrivate.delete<{ message: string }>(
                `/admin/announcements-surveys/${id}`
            );
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
            toast.success(data.message || "Élément supprimé avec succès");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Erreur lors de la suppression");
        }
    });
};
