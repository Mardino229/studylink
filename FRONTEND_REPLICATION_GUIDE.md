# Guide de Réplication de l'Architecture Frontend (React + Vite)

Ce document décrit en détail la structure, les bibliothèques clés, les intercepteurs API, la persistance de l'authentification et les bonnes pratiques appliqués au projet **StudyLink**. Il est conçu pour être directement utilisable comme référence ou modèle (boilerplate) pour tout nouveau projet React + Vite afin d'en conserver les mêmes similarités architecturales.

---

## 1. Choix Technologiques & Bibliothèques Phares

Voici les dépendances principales à installer dans votre nouveau projet pour obtenir la même base technique :

### Framework et Build Tools
- **React 19** (`react`, `react-dom`) : Utilisation de la dernière version majeure de React.
- **Vite 7** (`vite`, `@vitejs/plugin-react`) : Outil de build ultra-rapide.
- **TypeScript 5** : Typage statique robuste.

### Routing, State & Data Fetching
- **React Router Dom v7** (`react-router-dom`) : Gestion des routes, redirections, et des layouts imbriqués via `<Outlet />`.
- **Axios** (`axios`) : Client HTTP pour communiquer avec l'API backend.
- **TanStack Query v5 (React Query)** (`@tanstack/react-query`) : Gestion globale du cache de l'API, synchronisation de l'état asynchrone, invalidation automatique du cache sur mutation, et gestion du statut de chargement/erreurs.

### Styling & UI
- **Tailwind CSS v4** (`tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/typography`) : Version 4 de Tailwind. Attention : elle utilise un compilateur sous forme de plugin Vite au lieu du fichier classique `tailwind.config.js`.
- **Framer Motion** (`framer-motion`, `motion`) : Bibliothèque d'animations pour des transitions d'interface fluides et premium.
- **Lucide React** (`lucide-react`) : Ensemble d'icônes vectorielles légères et modernes.
- **Sonner** (`sonner`) : Gestionnaire de toasts et notifications esthétiques avec support pour les thèmes (dark/light) et couleurs enrichies.

### Formulaires et Validation
- **React Hook Form** (`react-hook-form`) : Gestion performante des formulaires sans re-render intempestifs.
- **Zod** (`zod` et `@hookform/resolvers`) : Validation de schémas de données en TypeScript, utilisée à la fois pour valider les formulaires côté client et typer les requêtes/réponses de l'API.

---

## 2. Structure Modulaire des Dossiers

Le projet suit une organisation modulaire sous le dossier `src/` :

```text
src/
├── assets/             # Images, illustrations, fichiers statiques
├── components/         # Composants d'interface réutilisables
│   ├── authComponent/  # Composants dédiés à la connexion/inscription
│   ├── common/         # Composants génériques (boutons, modales, etc.)
│   └── layout/         # Gestion du contexte utilisateur global (UserContextProvider)
├── context/            # Contextes React globaux et route-guards (AuthContext, RequireAuth, AdminGuard)
├── hoooks/             # Hooks personnalisés (⚠️ typo "hoooks" avec 3 'o' dans ce projet, par convention préférez "hooks")
├── icons/              # Icônes SVG personnalisées et composants d'icônes
├── layout/             # Structures de mise en page globales (AppLayout, AdminLayout) avec Sidebar et Header
├── pages/              # Pages de l'application (divisées en pages publiques d'auth, pages privées utilisateur, pages admin)
├── services/           # Services additionnels (ex. données mockées pour le développement local)
├── types/              # Déclarations globales de types TypeScript
├── utils/              # Fichiers de configuration Axios et hooks d'API groupés par domaine (utils/course.ts, utils/workspace.ts)
├── App.css             # Styles globaux spécifiques de l'application
├── App.tsx             # Configuration de la table de routage principale (React Router)
├── constant.ts         # Définition des constantes globales (ex. UserContext initial, listes d'étapes)
├── index.css           # Configuration Tailwind v4 et directives globales CSS
└── main.tsx            # Point d'entrée de l'application avec les providers globaux
```

---

## 3. Configuration & Initialisation (Boilerplate)

### Étape A : Configuration de Tailwind CSS v4 (`vite.config.ts`)
Dans Tailwind v4, l'intégration se fait directement via un plugin Vite. Plus besoin de `tailwind.config.js`.

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Plugin Tailwind CSS v4
  ],
})
```

Dans votre `src/index.css` :
```css
@import "tailwindcss";

/* Vos customisations de thèmes v4 s'effectuent via @theme */
@theme {
  --color-brand-primary: #10b981;
  --color-brand-secondary: #3b82f6;
}
```

---

### Étape B : Point d'entrée de l'application (`src/main.tsx`)
Initialise les providers globaux nécessaires (QueryClient, Context Utilisateur, Helmet, Toasts).

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from "sonner"
import App from './App.tsx'
import { UserContextProvider } from "./components/layout/userContextProvider.tsx"
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Évite les requêtes inutiles au focus de la fenêtre
      retry: 1,                    // Limite les tentatives d'appel en cas d'erreur
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserContextProvider>
        <HelmetProvider>
          <App />
          <Toaster richColors position="top-center" />
        </HelmetProvider>
      </UserContextProvider>
    </QueryClientProvider>
  </StrictMode>
)
```

---

## 4. Intégration de l'API & Gestion de Session (Cookies HttpOnly)

Le projet s'appuie sur une authentification sécurisée par cookies **HttpOnly/Secure** gérés par le navigateur. Cela implique que le client frontend ne lit jamais le token manuellement (pas de stockage dans le `localStorage`), mais configure chaque appel API pour envoyer et recevoir les cookies de session.

### 1. Configuration Axios (`src/utils/api.ts`)
On crée deux instances d'Axios :
- `axiosClient` : Pour les requêtes publiques (login, inscription, confirmation).
- `axiosPrivate` : Pour les requêtes privées nécessitant l'authentification. Elle recevra des intercepteurs pour renouveler automatiquement la session.

```typescript
// src/utils/api.ts
import axios from "axios";

export const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const defaultHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

// Instance pour les requêtes publiques
export const axiosClient = axios.create({
    baseURL: baseUrl,
    headers: defaultHeaders,
    withCredentials: true, // Crucial pour envoyer/recevoir les cookies HttpOnly
});

// Instance pour les requêtes authentifiées
export const axiosPrivate = axios.create({
    baseURL: baseUrl,
    headers: defaultHeaders,
    withCredentials: true,
});
```

---

### 2. Renouvellement Silencieux du Token (Silent Refresh)
Si la session expire, l'API renvoie un code d'erreur `401` ou `403`. Un intercepteur intercepte cette erreur, déclenche une requête sur `/auth/refresh` pour renouveler les cookies côté serveur, puis rejoue la requête initiale en toute transparence pour l'utilisateur.

#### Hook `useRefreshToken` (`src/hoooks/useRefreshToken.ts`)
```typescript
// src/hoooks/useRefreshToken.ts
import { axiosPrivate } from "../utils/api.ts";
import { useQueryClient } from "@tanstack/react-query";

const useRefreshToken = () => {
    const queryClient = useQueryClient();

    return async () => {
        try {
            // Appelle le refresh. Le backend lit le refresh token dans le cookie HttpOnly
            await axiosPrivate.post('auth/refresh', {});
            // Invalide le cache utilisateur pour forcer la mise à jour des données de session
            await queryClient.invalidateQueries({ queryKey: ['user'] });
        } catch (err) {
            console.error("Session expirée, reconnexion requise.", err);
        }
    }
}

export default useRefreshToken;
```

#### Hook Intercepteur `useAxiosPrivate` (`src/hoooks/useAxiosPrivate.ts`)
```typescript
// src/hoooks/useAxiosPrivate.ts
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken.ts";
import { axiosPrivate } from "../utils/api.ts";
import { useUser } from "../components/layout/userContext.tsx";

export const useAxiosPrivate = () => {
    const { user } = useUser();
    const refresh = useRefreshToken();

    useEffect(() => {
        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                // Si l'API retourne 401 ou 403 et que la requête n'a pas déjà été rejouée (sent)
                if ((error?.response?.status === 401 || error?.response?.status === 403) && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    try {
                        await refresh();
                        return axiosPrivate(prevRequest); // Rejoue la requête originale
                    } catch (refreshError) {
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [user, refresh]);

    return axiosPrivate;
}
```

---

## 5. Gardes de Route & Gestion de Rôles

Les routes sont protégées de manière hiérarchique en enveloppant les pages dans des composants Route-Guards qui partagent le contexte utilisateur.

### Le Provider d'état de l'utilisateur (`src/components/layout/userContextProvider.tsx`)
```tsx
import { type ReactNode, useState } from "react";
import { UserContext } from "../../constant"; // Créez-le via createContext
import type { User } from "../../utils/type";

export function UserContextProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>({});
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}
```

### Le Hook d'accès rapide (`src/components/layout/userContext.tsx`)
```typescript
import { useContext } from "react";
import { UserContext } from "../../constant.ts";

export function useUser() {
    return useContext(UserContext);
}
```

### Route-Guard : Connexion Obligatoire (`src/context/RequireAuth.tsx`)
Vérifie au chargement si l'utilisateur est connu en local. Sinon, tente de récupérer les informations de profil sur l'endpoint `/user/me`. En cas d'échec total, redirige vers la page `/login`.

```tsx
// src/context/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../components/layout/userContext.tsx";
import { axiosPrivate } from "../utils/api.ts";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

const RequireAuth = () => {
    const { user, setUser } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        const verifySession = async () => {
            try {
                // Tente de charger le profil de l'utilisateur connecté
                const response = await axiosPrivate.get('user/me');
                const userData = response.data.data.user;
                if (isMounted) {
                    setUser(userData);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Aucune session active trouvée.', error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        if (!user?.email) {
            verifySession();
        } else {
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        }
    }, [user?.email, setUser]);

    if (isLoading) {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <Loader className="h-12 w-12 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!user?.email && !isLoading) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}

export default RequireAuth;
```

### Route-Guard : Rôle Administrateur (`src/context/AdminGuard.tsx`)
Se place en dessous de `RequireAuth`. Il s'assure que le compte est actif et possède le rôle d'administrateur.

```tsx
// src/context/AdminGuard.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../components/layout/userContext.tsx";

export default function AdminGuard() {
  const { user } = useUser();
  const location = useLocation();
  const isAdmin = user?.role?.name === 'admin';
  const isActive = user?.is_active;

  if (!isActive) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;
  
  return <Outlet />;
}
```

### Utilisation dans les Routes (`src/App.tsx`)
```tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RequireAuth from "./context/RequireAuth";
import AdminGuard from "./context/AdminGuard";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import AdminHome from "./pages/admin/AdminHome";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />

        {/* Routes authentifiées obligatoires */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
          </Route>

          {/* Sous-section réservée aux admins */}
          <Route element={<AdminGuard />}>
            <Route path="/admin/home" element={<AdminHome />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
```

---

## 6. Bonnes Pratiques d'Intégration d'API (TanStack Query + Zod)

Dans StudyLink, **tous les appels API sont encapsulés dans des hooks de requêtes personnalisés** situés dans le dossier `src/utils/` (ou `src/services/`), classés par domaine. 

### Exemple Standard de Fichier d'Intégration d'un Domaine (`src/utils/course.ts`)

Pour intégrer un nouveau domaine (ex: Gestion des Cours) :

1. **Validation & Typage avec Zod** : Valider les données d'entrée des formulaires et dériver les types TypeScript.
2. **Requête de Lecture (`useQuery`)** : Retourne les données fetchées via l'instance `axiosPrivate`.
3. **Requêtes de Modification (`useMutation`)** :
   - Effectuent l'appel HTTP en POST/PATCH/DELETE.
   - **`onSuccess`** : Exécutent `queryClient.invalidateQueries` sur la clé de requête concernée pour déclencher un re-fetch en arrière-plan et garder l'interface à jour sans rechargement de page. Affichent un toast de succès avec `sonner`.
   - **`onError`** : Affichent l'erreur en toast via `sonner` en inspectant dynamiquement l'erreur Axios retournée par le backend.

```typescript
// src/utils/course.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import type { AxiosError } from "axios";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate.ts";

// 1. Schéma de validation Zod
export const courseSchema = z.object({
    course_name: z.string().min(1, "Le nom du cours est obligatoire"),
    course_color: z.string().min(1, "La couleur est obligatoire")
});

export type CourseFormRequest = z.infer<typeof courseSchema>;

export type Course = {
    id: string;
    course_name: string;
    course_color: string;
    created_at?: string;
    updated_at?: string;
};

// 2. Query Hook pour récupérer la liste
export const useGetCourses = () => {
    const axiosPrivate = useAxiosPrivate();
    return useQuery({
        queryKey: ["courses"],
        queryFn: async () => {
            const response = await axiosPrivate.get<{ data: Course[] }>("/courses");
            return response.data.data;
        },
    });
};

// 3. Mutation Hook pour créer un cours
export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    return useMutation({
        mutationFn: async (data: CourseFormRequest) => {
            const response = await axiosPrivate.post<{ data: Course }>("/courses", data);
            return response.data.data;
        },
        onSuccess: () => {
            // Force la mise à jour instantanée du composant de liste
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast.success("Cours créé avec succès");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ detail: string }>;
            toast.error("Erreur lors de la création du cours", {
                description: axiosError.response?.data?.detail || "Une erreur est survenue",
            });
        },
    });
};
```

---

## 7. Checklist d'application pour votre nouveau projet

1. **Générer le projet** :
   ```bash
   npx -y create-vite@latest mon-nouveau-projet --template react-ts
   ```
2. **Installer les packages essentiels** :
   ```bash
   npm install react-router-dom axios @tanstack/react-query @tailwindcss/vite lucide-react sonner zod react-hook-form @hookform/resolvers react-helmet-async framer-motion
   ```
3. **Activer Tailwind v4** dans `vite.config.ts` et importer `@import "tailwindcss";` dans `src/index.css`.
4. **Créer la structure des dossiers** (`components`, `context`, `hooks`, `layout`, `pages`, `utils`).
5. **Mettre en place la configuration de l'API** (`src/utils/api.ts`).
6. **Copier les hooks d'authentification** (`useAxiosPrivate.ts` et `useRefreshToken.ts`).
7. **Ajouter les guards** (`RequireAuth.tsx`, `AdminGuard.tsx`) et envelopper les routes dans `App.tsx`.
8. **Initialiser les Providers** globaux dans `main.tsx`.
9. **Développer vos features** en créant des hooks customisés (`useQuery` / `useMutation`) par domaine dans `utils/`.
