import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "./api.ts";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate.ts";
import type { SubscriptionPlan } from "./type.ts";

const FALLBACK_PLANS: SubscriptionPlan[] = [
    {
        id: "pro",
        name: "Pro",
        price: "6.99",
        annual_price: "49.99",
        description: "Accès illimité à toutes les fonctionnalités",
        benefits_description: [
            "Résumés, flashcards et quiz illimités",
            "Assistant IA illimité",
            "Accès aux épreuves et corrigés",
            "Espaces de travail illimités",
        ],
        includes_audio: false,
    },
    {
        id: "ultra",
        name: "Ultra",
        price: "9.99",
        annual_price: "69.99",
        description: "Tout Pro + podcasts audio et résumés audio exclusifs",
        benefits_description: [
            "Tout ce qui est inclus dans Pro",
            "Résumés audio de tes documents",
            "Podcasts éducatifs générés par IA",
            "Accès prioritaire aux nouvelles fonctionnalités",
        ],
        includes_audio: true,
    },
];

export const useGetPublicPlans = () => {
    return useQuery({
        queryKey: ["plans-public"],
        queryFn: async () => {
            try {
                const response = await axiosClient.get<{ data: SubscriptionPlan[] }>(
                    "/subscription-plans"
                );
                return response.data.data?.length ? response.data.data : FALLBACK_PLANS;
            } catch {
                return FALLBACK_PLANS;
            }
        },
        staleTime: 5 * 60_000,
    });
};

export const useGetPlans = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["plans"],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ data: SubscriptionPlan[] }>(
                "/admin/subscription-plans"
            );
            return response.data.data;
        },
    });
};
