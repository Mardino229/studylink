import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate.ts";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export type TicketType = 'report_issue' | 'feature_request' | 'get_help' | 'feedback';
export type TicketStatus = 'new' | 'seen' | 'handled';

export interface SupportTicket {
    id: string;
    user_id: string | null;
    email: string;
    message: string;
    type: TicketType;
    status: TicketStatus;
    created_at: string;
}

export const useSubmitSupportTicket = () => {
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (data: { message: string; type: TicketType; email?: string }) => {
            const response = await axiosPrivate.post<{ success: boolean; data: SupportTicket }>('/support/', data);
            return response.data.data;
        },
        onError: (error: AxiosError<{ detail?: string }>) => {
            toast.error("Erreur lors de l'envoi", {
                description: error.response?.data?.detail || "Une erreur est survenue.",
            });
        },
    });
};

export const useGetAdminSupportTickets = (limit = 100, skip = 0) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ['admin-support-tickets', limit, skip],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ success: boolean; data: SupportTicket[] }>(
                `/admin/support-tickets?skip=${skip}&limit=${limit}`
            );
            return response.data.data;
        },
    });
};

export const useUpdateTicketStatus = () => {
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) => {
            const response = await axiosPrivate.patch<{ success: boolean; data: SupportTicket }>(
                `/admin/support-tickets/${id}/status`,
                { status }
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
        },
        onError: (error: AxiosError<{ detail?: string }>) => {
            toast.error("Erreur lors de la mise à jour du statut", {
                description: error.response?.data?.detail || "Une erreur est survenue.",
            });
        },
    });
};
