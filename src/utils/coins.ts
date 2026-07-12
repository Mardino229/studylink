import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate";
import type { CoinTransaction } from "../types/exams";

const err = (error: unknown) =>
    (error as AxiosError<{ detail: string }>).response?.data?.detail || "Une erreur est survenue";

export const useGetCoinBalance = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["coin-balance"],
        queryFn: async () => {
            const res = await axiosPrivate.get<{data: { coin_balance: number; [key: string]: unknown }}>("/rewards/coins/balance");
            return res.data.data;
        },
    });
};

export const useGetCoinTransactions = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["coin-transactions"],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: CoinTransaction[] }>("/rewards/coins/transactions");
            return res.data.data;
        },
    });
};

export const useConvertCoins = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async () => {
            const res = await axiosPrivate.post("/rewards/coins/convert");
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coin-balance"] });
            queryClient.invalidateQueries({ queryKey: ["coin-transactions"] });
            queryClient.invalidateQueries({ queryKey: ["token-balance"] });
            toast.success("Conversion réussie !", { description: "1 jeton crédité sur votre solde." });
        },
        onError: (error) => {
            toast.error("Conversion impossible", { description: err(error) });
        },
    });
};
