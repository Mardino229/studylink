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
    email?: string;
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
    id?: string;
    email?: string;
    first_name?: string | null;
    last_name?: string | null;
    is_active?: boolean;
    study_level_id?: string | null;
    faculty_id?: string | null;
    program_id?: string | null;
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
    includes_audio: boolean;
}

export interface SubscriptionPlanBilingual {
    id: string;
    name: string;
    price: string | number;
    annual_price: string | number;
    includes_audio: boolean;
    description_fr: string;
    description_en: string;
    benefits_description_fr: string[];
    benefits_description_en: string[];
    stripe_product_id?: string;
    stripe_monthly_price_id?: string;
    stripe_annual_price_id?: string;
}

export interface SubscriptionPlanRequest {
    name: string;
    price: number;
    annual_price: number;
    includes_audio: boolean;
    description_fr?: string;
    description_en?: string;
    benefits_description_fr?: string[];
    benefits_description_en?: string[];
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
    pending_plan_id?: string | null;
    pending_billing_type?: string | null;
    cancel_at_period_end?: boolean;
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

    // Discriminant — "subscription" ou "token_pack"
    transaction_type: "subscription" | "token_pack";

    // Champs abonnement (null pour les packs de jetons)
    plan_id?: string | null;
    plan?: SubscriptionPlan | null;
    plan_name?: string | null;
    billing_type?: "monthly" | "annual" | null;
    subscription_id?: string | null;

    // Champ pack de jetons (null pour les abonnements)
    token_pack_id?: string | null;

    // Champs communs
    amount: string;
    currency: string;
    status: "pending" | "completed" | "failed" | "refunded";
    stripe_session_id?: string | null;
    stripe_payment_intent_id?: string | null;
    payment_date?: string | null;
    created_at: string;
    updated_at: string;

    // Champs joints optionnels (selon l'endpoint)
    user_first_name?: string | null;
    user_last_name?: string | null;
    user_email?: string | null;
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

export type TokenTransactionType = 'purchase' | 'artefact' | 'corrige' | 'chat' | 'bonus' | 'refund';

export interface TokenTransaction {
    id: string;
    amount: number;
    type: TokenTransactionType;
    description: string | null;
    created_at: string;
}

export interface AdminDashboardResponse {
    kpis: {
        totalUsers: number;
        activeSubscriptions: number;
        monthlyRevenue: number;
        monthlySubscriptionRevenue?: number;
        monthlyTokenRevenue?: number;
        totalTokensCredited?: number;
        totalTokensSpent?: number;
    };
    charts: {
        activity: Array<{ name: string; data: number[] }>;
        revenue: Array<{ name: string; data: number[] }>;
    };
    tokenAnalytics?: {
        packsSold: Array<{ packName: string; tokens: number; salesCount: number; revenue: number }>;
        consumption: {
            artefact?: { count: number; tokensSpent: number };
            corrige?: { count: number; tokensSpent: number };
            chat?: { count: number; tokensSpent: number };
        };
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
        type: 'subscription' | 'token_pack';
        user: { id: string; name: string };
        amount: number;
        currency: string;
        label: string;
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