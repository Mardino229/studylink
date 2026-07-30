import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate";

export type Period = "3m" | "6m" | "12m";

export interface RevenueMonth {
    month: string;
    revenue_cad: number;
}

export interface RevenueReport {
    months: RevenueMonth[];
    total_cad: number;
    currency: string;
}

export interface SubscriptionMonth {
    month: string;
    new_subscriptions: number;
}

export interface SubscriptionsReport {
    months: SubscriptionMonth[];
    total_new: number;
    active_count: number;
    canceled_count: number;
}

export interface ReportsSummary {
    total_users: number;
    active_subscriptions: number;
    mrr_cad: number;
    revenue_this_month_cad: number;
    revenue_last_month_cad: number;
    token_packs_sold_this_month: number;
}

export const useRevenueReport = (period: Period) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["admin-reports-revenue", period],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: RevenueReport }>(
                `/admin/reports/revenue?period=${period}`
            );
            return res.data.data;
        },
    });
};

export const useSubscriptionsReport = (period: Period) => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["admin-reports-subscriptions", period],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: SubscriptionsReport }>(
                `/admin/reports/subscriptions?period=${period}`
            );
            return res.data.data;
        },
    });
};

export const useReportsSummary = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["admin-reports-summary"],
        queryFn: async () => {
            const res = await axiosPrivate.get<{ data: ReportsSummary }>(
                `/admin/reports/summary`
            );
            return res.data.data;
        },
        staleTime: 2 * 60_000,
    });
};
