import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "./api.ts";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate.ts";
import type { SubscriptionPlan } from "./type.ts";

export const useGetPublicPlans = () => {
    return useQuery({
        queryKey: ["plans-public"],
        queryFn: async () => {
            const response = await axiosClient.get<{ data: SubscriptionPlan[] }>(
                "/admin/subscription-plans"
            );
            return response.data.data;
        },
        staleTime: 5 * 60_000,
        retry: 2,
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
