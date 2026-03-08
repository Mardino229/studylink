import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate.ts";

export interface FeedbackRequest {
  email?: string;
  rating: number;
  message: string;
}

export const useCreateFeedback = () => {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FeedbackRequest) => {
      const response = await axiosPrivate.post<{ data: any }>("/feedbacks", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      toast.success("Merci pour votre retour !", {
        description: "Votre avis a été envoyé avec succès",
      });
    },
    onError: (error) => {
      console.error(error);
      const err = error as unknown as {
        response: {
          data: {
            message?: string;
            errors?: Record<string, string>;
          };
          status: number;
        };
      };

      if (err.response?.status === 422 && err.response.data.errors) {
        const firstError = Object.values(err.response.data.errors)[0];
        toast.error("Validation échouée", {
          description: firstError || "Veuillez vérifier vos informations",
        });
      } else {
        toast.error("Erreur lors de l'envoi", {
          description: err.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.",
        });
      }
    },
  });
};
