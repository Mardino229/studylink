import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "./api.ts";
import type { SubscriptionPlan } from "./type.ts";

export const useGetPlans = () => {
    return useQuery({
        queryKey: ["plans"],
        queryFn: async () => {
            const response = await axiosClient.get<{ data: SubscriptionPlan[] }>(
                "/admin/subscription-plans"
            );
            return response.data.data;
        },
    });
};
