import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate.ts";

export interface Payment {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: string;
  method: string;
  created_at?: string;
  updated_at?: string;
}

export const useGetPayments = () => {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      try {
        const response = await axiosPrivate.get<{ data: Payment[] }>("/payments");
        return response.data.data || [];
      } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
        toast.error("Erreur lors du chargement des paiements", {
          description: axiosError.response?.data?.detail || axiosError.response?.data?.message || "Impossible de charger les données",
        });
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
