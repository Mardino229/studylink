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
        mutationFn: async (subscriptionId: number) => {
            const response = await axiosPrivate.patch<{ success: boolean; message: string }>(
                `/subscriptions/${subscriptionId}/cancel`
            );
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Abonnement annulé avec succès");
            queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
        },
        onError: (error: AxiosError<{ detail?: string }>) => {
            toast.error("Erreur lors de l'annulation", {
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
