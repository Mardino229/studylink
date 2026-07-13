import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate";
import { axiosClient } from "./api";
import type { TokenTransaction } from "./type";

export type TokenPack = {
    id: string;
    name: string;
    tokens: number;
    price_cad: string;
    is_active: boolean;
};

export type TokenBalance = {
    balance: number;
    chat_messages_count: number;
    updated_at: string;
};

export type TokenStats = {
    balance: number;
    totalTokensPurchased: number;
    totalTokensSpent: number;
    consumption: {
        artefact?: { count: number; tokensSpent: number };
        corrige?: { count: number; tokensSpent: number };
        chat?: { count: number; tokensSpent: number };
        audio?: { count: number; tokensSpent: number };
    };
};

export const useGetTokenBalance = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["token-balance"],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: TokenBalance }>("/tokens/balance");
            return res.data.data;
        },
        staleTime: 30_000,
    });
};

export const useGetTokenPacks = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["token-packs"],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: TokenPack[] }>("/tokens/packs");
            return res.data.data;
        },
    });
};

// Public version for the landing page (no auth required)
export const useGetPublicTokenPacks = () => {
    return useQuery({
        queryKey: ["token-packs-public"],
        queryFn: async () => {
            try {
                const res = await axiosClient.get<{ data: TokenPack[] }>("/tokens/packs");
                return res.data.data;
            } catch {
                return FALLBACK_PACKS;
            }
        },
        staleTime: 5 * 60_000,
    });
};

const FALLBACK_PACKS: TokenPack[] = [
    { id: 'starter',  name: 'Starter',  tokens: 10, price_cad: '2.99',  is_active: true },
    { id: 'standard', name: 'Standard', tokens: 35, price_cad: '7.99',  is_active: true },
    { id: 'maxi',     name: 'Maxi',     tokens: 80, price_cad: '14.99', is_active: true },
];

export const useBuyTokenPack = () => {
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (packId: string) => {
            const res = await axiosPrivate.post<{ data: { checkout_url: string } }>(
                `/tokens/packs/${packId}/checkout`,
                {
                    success_url: `${window.location.origin}/payment/success`,
                    cancel_url: `${window.location.origin}/payment/cancel`,
                }
            );
            return res.data.data;
        },
        onSuccess: ({ checkout_url }) => {
            localStorage.setItem("pending_transaction_type", "token_pack");
            localStorage.setItem("pending_token_checkout_time", Date.now().toString());
            window.location.href = checkout_url;
        },
        onError: (error: AxiosError<{ detail?: string }>) => {
            toast.error("Erreur lors de l'achat", {
                description: error.response?.data?.detail || "Une erreur est survenue.",
            });
        },
    });
};

export const useGetTokenStats = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["token-stats"],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: TokenStats }>("/tokens/stats");
            return res.data.data;
        },
    });
};

export const useGetTokenTransactions = (skip = 0, limit = 50) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["token-transactions", skip, limit],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: TokenTransaction[] }>(
                `/tokens/transactions?skip=${skip}&limit=${limit}`
            );
            return res.data.data;
        },
    });
};
