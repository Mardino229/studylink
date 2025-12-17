export type AdminUser = { id: string; name: string; email: string; status: "active" | "pending" | "blocked"; role: "admin" | "user" };
export type AdminPlan = { id: string; name: string; price: number; interval: "month" | "year"; features: string[] };
export type AdminSubscription = { id: string; userId: string; planId: string; status: "active" | "canceled" | "past_due"; renewAt: string };
export type AdminPayment = { id: string; userId: string; amount: number; currency: string; status: "paid" | "refunded" | "failed"; date: string };
export type AdminAnnouncement = { id: string; title: string; content: string; createdAt: string };
export type AdminFeedback = { id: string; userId: string; subject: string; message: string; status: "open" | "resolved"; createdAt: string };

export const mockUsers: AdminUser[] = [
  { id: "u1", name: "Alice Dupont", email: "alice@example.com", status: "active", role: "admin" },
  { id: "u2", name: "Bob Martin", email: "bob@example.com", status: "active", role: "user" },
  { id: "u3", name: "Chloé Durand", email: "chloe@example.com", status: "pending", role: "user" },
  { id: "u4", name: "David Bernard", email: "david@example.com", status: "blocked", role: "user" }
];

export const mockPlans: AdminPlan[] = [
  { id: "p1", name: "Basic", price: 5, interval: "month", features: ["100 summaries", "Email support"] },
  { id: "p2", name: "Pro", price: 15, interval: "month", features: ["Unlimited", "Priority support"] },
  { id: "p3", name: "Team", price: 99, interval: "year", features: ["Team features", "SSO"] }
];

export const mockSubscriptions: AdminSubscription[] = [
  { id: "s1", userId: "u2", planId: "p1", status: "active", renewAt: "2026-01-10" },
  { id: "s2", userId: "u3", planId: "p2", status: "past_due", renewAt: "2025-12-22" },
  { id: "s3", userId: "u4", planId: "p1", status: "canceled", renewAt: "-" }
];

export const mockPayments: AdminPayment[] = [
  { id: "pay1", userId: "u2", amount: 5, currency: "EUR", status: "paid", date: "2025-12-01" },
  { id: "pay2", userId: "u3", amount: 15, currency: "EUR", status: "failed", date: "2025-12-05" },
  { id: "pay3", userId: "u2", amount: 5, currency: "EUR", status: "paid", date: "2025-12-10" }
];

export const mockAnnouncements: AdminAnnouncement[] = [
  { id: "a1", title: "Nouvelle version", content: "Améliorations de performance.", createdAt: "2025-12-01" },
  { id: "a2", title: "Maintenance", content: "Maintenance prévue ce week-end.", createdAt: "2025-12-12" }
];

export const mockFeedbacks: AdminFeedback[] = [
  { id: "f1", userId: "u2", subject: "Bug UI", message: "Le bouton ne répond pas.", status: "open", createdAt: "2025-12-06" },
  { id: "f2", userId: "u3", subject: "Suggestion", message: "Ajouter un thème clair/sombre auto.", status: "resolved", createdAt: "2025-12-02" }
];

export const idToUser = (id: string) => mockUsers.find(u => u.id === id)?.name ?? id;
export const idToPlan = (id: string) => mockPlans.find(p => p.id === id)?.name ?? id;
