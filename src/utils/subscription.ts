import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate.ts";
import type {
    Subscription,
    PaginatedTransactions,
    TransactionStats,
    CheckoutResponse,
    CheckoutRequest
} from "./type.ts";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export const useGetMySubscriptions = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["my-subscriptions"],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ success: boolean; data: Subscription[] }>(
                "/subscriptions/"
            );
            return response.data.data;
        },
    });
};

export const  useGetMyActiveSubscription = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["my-active-subscription"],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ success: boolean; data: Subscription }>(
                "/subscriptions/active"
            );
            return response.data.data;
        },
    });
};

export const useCreateCheckout = () => {
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (data: CheckoutRequest) => {
            const response = await axiosPrivate.post<{ success: boolean; data: CheckoutResponse }>(
                "/subscriptions/checkout",
                data
            );
            return response.data.data;
        },
        onError: (error: AxiosError<{ detail?: string }>) => {
            toast.error("Erreur lors de l'initialisation du paiement", {
                description: error.response?.data?.detail || "Une erreur est survenue.",
            });
        },
    });
};

export const useCancelSubscription = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (subscriptionId: string) => {
            const response = await axiosPrivate.patch<{ success: boolean; message: string; data: Subscription }>(
                `/subscriptions/${subscriptionId}/cancel`
            );
            return response.data;
        },
        onSuccess: () => {
            toast.success("Annulation programmée — vous gardez l'accès jusqu'à la fin de la période.");
            queryClient.invalidateQueries({ queryKey: ["my-active-subscription"] });
            queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
        },
        onError: (error: AxiosError<{ detail?: string }>) => {
            toast.error("Erreur lors de l'annulation", {
                description: error.response?.data?.detail || "Une erreur est survenue.",
            });
        },
    });
};

export const useChangePlan = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ new_plan_id, billing_type }: { new_plan_id: string; billing_type?: "monthly" | "annual" }) => {
            const response = await axiosPrivate.post<{ success: boolean; message: string; data: Subscription }>(
                "/subscriptions/change-plan",
                { new_plan_id, billing_type }
            );
            return response.data;
        },
        onSuccess: (data) => {
            const sub = data.data;
            const isImmediate = sub.plan_id === sub.pending_plan_id || !sub.pending_plan_id;
            if (isImmediate) {
                toast.success("Plan mis à jour — vos nouveaux avantages sont actifs immédiatement.");
            } else {
                const date = sub.end_date ? new Date(sub.end_date).toLocaleDateString("fr-CA") : "";
                toast.success(`Changement programmé — votre plan changera le ${date}.`);
            }
            queryClient.invalidateQueries({ queryKey: ["my-active-subscription"] });
            queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
        },
        onError: (error: AxiosError<{ detail?: string }>) => {
            toast.error("Erreur lors du changement de plan", {
                description: error.response?.data?.detail || "Une erreur est survenue.",
            });
        },
    });
};

export const useUndoCancel = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (subscriptionId: string) => {
            const response = await axiosPrivate.patch<{ success: boolean; message: string; data: Subscription }>(
                `/subscriptions/${subscriptionId}/undo-cancel`
            );
            return response.data;
        },
        onSuccess: () => {
            toast.success("Annulation annulée — votre abonnement se renouvellera normalement.");
            queryClient.invalidateQueries({ queryKey: ["my-active-subscription"] });
            queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
        },
        onError: (error: AxiosError<{ detail?: string }>) => {
            toast.error("Impossible d'annuler la résiliation", {
                description: error.response?.data?.detail || "Une erreur est survenue.",
            });
        },
    });
};

export const useGetTransactions = (limit = 20, skip = 0) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["transactions", limit, skip],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ success: boolean; data: PaginatedTransactions }>(
                `/subscriptions/transactions?limit=${limit}&skip=${skip}`
            );
            return response.data.data;
        },
    });
};

export const useGetAdminTransactions = (limit = 50, skip = 0, status?: string, userId?: number) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["admin-transactions", limit, skip, status, userId],
        queryFn: async () => {
            let url = `/admin/transactions?limit=${limit}&skip=${skip}`;
            if (status && status !== "all") url += `&status=${status}`;
            if (userId) url += `&user_id=${userId}`;

            const response = await axiosPrivate.get<{ success: boolean; data: PaginatedTransactions }>(url);
            return response.data.data;
        },
    });
};

export const useGetTransactionStats = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["admin-transaction-stats"],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ success: boolean; data: TransactionStats }>(
                "/admin/transactions/stats"
            );
            return response.data.data;
        },
    });
};
