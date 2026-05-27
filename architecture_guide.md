# Guide d'Architecture : Intégration API, Authentification et Rôles

Ce document explique comment l'application StudyLink gère l'intégration de l'API, la structure du projet, et la gestion des rôles (Utilisateur/Admin) avec l'authentification basée sur les cookies.

## 1. Structure du Projet

L'application suit une structure modulaire pour séparer les responsabilités :

- **`src/components/`** : Composants UI réutilisables.
- **`src/context/`** : Providers pour l'état global et Gardes de route (`RequireAuth`, `AdminGuard`).
- **`src/hoooks/`** : Hooks personnalisés (`useAuth`, `useAxiosPrivate`, `useRefreshToken`).
- **`src/services/`** : Appels API organisés par domaine.
- **`src/utils/`** : Configuration Axios (`api.ts`).

## 2. Intégration de l'API et Cookies

L'authentification repose sur des **cookies (HttpOnly)** gérés par le navigateur. Pour que les cookies soient envoyés à chaque requête, nous utilisons l'option `withCredentials: true`.

### Configuration Axios (`src/utils/api.ts`)

```typescript
import axios from "axios";

export const baseUrl = "http://localhost:8000/api/v1";

export const axiosClient = axios.create({
    baseURL: baseUrl,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // Très important pour les cookies
});

export const axiosPrivate = axios.create({
    baseURL: baseUrl,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // Indispensable pour envoyer les cookies de session
});
```

### Gestion du Refresh Token Automatique

Si un cookie d'accès expire (erreur 401/403), un intercepteur intercepte l'erreur et tente de rafraîchir la session sans déconnecter l'utilisateur.

#### Hook `useAxiosPrivate` (`src/hoooks/useAxiosPrivate.ts`)

```typescript
export const useAxiosPrivate = () => {
    const refresh = useRefreshToken();

    useEffect(() => {
        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                // Si 401 ou 403, on tente un refresh une seule fois (prevRequest.sent)
                if ((error?.response?.status === 401 || error?.response?.status === 403) && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    await refresh(); // Appelle l'endpoint de refresh
                    return axiosPrivate(prevRequest); // Rejoue la requête initiale
                }
                return Promise.reject(error);
            }
        );
        return () => axiosPrivate.interceptors.response.eject(responseIntercept);
    }, [refresh]);

    return axiosPrivate;
}
```

#### Hook `useRefreshToken` (`src/hoooks/useRefreshToken.ts`)

L'endpoint `/auth/refresh` ne prend pas d'arguments car il lit directement le refresh token dans les cookies sécurisés du navigateur.

```typescript
const useRefreshToken = () => {
    return async () => {
        try {
            await axiosPrivate.post('auth/refresh', {});
            // Optionnel : invalider le cache pour forcer la mise à jour des données user
            await queryClient.invalidateQueries({ queryKey: ['user'] });
        } catch (err) {
            console.error("Session expirée, redirection nécessaire.");
        }
    }
}
```

## 3. Gardes de Route et Rôles

La protection est hiérarchique. Une route peut nécessiter d'être connecté, PUIS d'être admin.

### RequireAuth (`src/context/RequireAuth.tsx`)
Vérifie si l'utilisateur est authentifié au chargement (souvent via un appel à `/user/me`).

### AdminGuard (`src/context/AdminGuard.tsx`)
Vérifie le rôle stocké dans l'objet user.

```typescript
export default function AdminGuard() {
  const { user } = useUser();
  const isAdmin = user?.role?.name === 'admin';
  const isActive = user?.is_active;

  if (!isActive) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;
  
  return <Outlet />; // Affiche les routes enfants si admin
}
```

## 4. Bibliothèques Clés Utilisées

Pour reproduire ce schéma, voici les bibliothèques indispensables utilisées dans StudyLink :

- **React Router Dom** (`react-router-dom`) : Gère toute la navigation et les gardes de route via des composants imbriqués.
- **Axios** (`axios`) : Client HTTP utilisé pour les requêtes, configuré avec des instances globales et des intercepteurs pour injecter/rafraîchir les tokens.
- **TanStack Query** (`@tanstack/react-query`) : Gère l'état asynchrone, le cache des données API et l'invalidation automatique (ex: après un refresh token).
- **Lucide React** (`lucide-react`) : Bibliothèque d'icônes utilisée pour l'UI.
- **Tailwind CSS** (`tailwindcss`) : Framework CSS pour un styling rapide et responsive.
- **Framer Motion** (`framer-motion`) : Utilisé pour les animations premium et les transitions fluides.
- **React Hook Form & Zod** : Pour la gestion et la validation robuste des formulaires (Login, Register).

### Implémentation dans `App.tsx`

```tsx
<Route element={<RequireAuth />}>
    <Route element={<AppLayout />}>
        <Route path="/home" element={<Home />} />
    </Route>

    {/* Protection admin imbriquée */}
    <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
            <Route path="/admin/home" element={<AdminHome />} />
        </Route>
    </Route>
</Route>
```

## 4. Résumé pour la Reproduction

1.  **Backend** : Doit envoyer des cookies `HttpOnly` et `Secure`.
2.  **Axios** : Toujours mettre `withCredentials: true`.
3.  **Interceptors** : Gérer le 401 pour appeler un endpoint `/refresh` qui renouvelle les cookies.
4.  **React Router** : Utiliser des `<Outlet />` enveloppés dans des composants de garde pour filtrer les accès par rôle.
