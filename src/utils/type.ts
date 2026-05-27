import type { Dispatch, SetStateAction } from "react";

export interface ValidationError {
    type: string;
    loc: string[];
    msg: string;
}

export type CompleteProfileRequest = {
    first_name: string; last_name: string; study_level_id: string; faculty_id?: string; program_id?: string; other_program?: string;
}

export type UpdateProfileRequest = {
    first_name: string;
    last_name: string;
    email: string;
    study_level_id?: string;
    faculty_id?: string;
    program_id?: string;
    other_program?: string;
}

export type UpdatePasswordRequest = {
    current_password: string;
    new_password: string;
    confirm_new_password: string;
    otp_code: string;
}

export type LoginFormRequest = {
    email: string;
    password: string;
}

export type RegisterFormRequest = {
    email: string;
    password: string;
    confirmPassword: string;
}

export type Role = {
    name: "user" | "admin";
}

export type User = {
    id?: number;
    email?: string;
    first_name?: string | null;
    last_name?: string | null;
    is_active?: boolean;
    study_level_id?: number | null;
    faculty_id?: number | null;
    program_id?: number | null;
    other_program?: string | null;
    role?: Role;
    study_level?: { id: string; name: string } | null;
    faculty?: { id: string; name: string } | null;
    program?: { id: string; name: string } | null;
}

export interface AdminUser {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    is_active: boolean;
    role: Role;
    faculty?: { id: string; name: string } | null;
    study_level?: { id: string; name: string } | null;
    program?: { id: string; name: string } | null;
    other_program?: string | null;
}

export interface AdminUsersResponse {
    users: AdminUser[];
    total: number;
    skip: number;
    limit: number;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: string | number;
    annual_price: string | number;
    description: string;
    benefits_description: string[];
}

export interface SubscriptionPlanRequest {
    name: string;
    price: number;
    annual_price: number;
    description: string;
    benefits_description: string[];
}

export interface Subscription {
    id: string;
    user_id: string;
    user_first_name?: string;
    user_last_name?: string;
    user_email?: string;
    plan_name?: string;
    plan_id: string;
    plan?: SubscriptionPlan;
    billing_type: "monthly" | "annual";
    status: "active" | "canceled" | "past_due";
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
}

export interface PaginatedSubscriptions {
    items: Subscription[];
    total: number;
    skip: number;
    limit: number;
}

export interface Transaction {
    id: string;
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_email: string;
    plan_name: string;
    billing_type: "monthly" | "annual";
    plan?: SubscriptionPlan;
    amount: string;
    currency: string;
    status: "pending" | "completed" | "failed" | "refunded";
    stripe_session_id: string;
    stripe_payment_intent_id?: string | null;
    subscription_id: string | null;
    payment_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedTransactions {
    items: Transaction[];
    total: number;
    skip: number;
    limit: number;
}

export interface TransactionStats {
    total_revenue: string;
    completed_count: number;
    failed_count: number;
    pending_count: number;
    total_count: number;
}

export interface CheckoutResponse {
    checkout_url: string;
    transaction_id: string;
    stripe_session_id: string;
}

export interface CheckoutRequest {
    plan_id: string;
    billing_type: "monthly" | "annual";
    success_url: string;
    cancel_url: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    url: string | null;
    type: "announcement" | "survey";
    deadline: string | null;
    created_at: string;
    updated_at: string;
}

export interface AnnouncementRequest {
    title: string;
    content: string;
    url?: string | null;
    type: "announcement" | "survey";
    deadline?: string | null;
}

export type UserContextProps = {
    user?: User;
    setUser: Dispatch<SetStateAction<User>>;
};

export interface AdminDashboardResponse {
    kpis: {
        totalUsers: number;
        activeSubscriptions: number;
        monthlyRevenue: number;
    };
    charts: {
        activity: Array<{ name: string; data: number[] }>;
        revenue: Array<{ name: string; data: number[] }>;
    };
    recentUsers: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
        createdAt: string;
    }>;
    recentTransactions: Array<{
        id: string;
        user: {
            id: string;
            name: string;
        };
        amount: number;
        planName: string;
        status: string;
        date: string;
    }>;
    systemActivity: Array<{
        id: string;
        message: string;
        date: string;
        color: string;
    }>;
}