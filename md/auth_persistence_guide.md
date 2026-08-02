# Guide : Gestion du Contexte Utilisateur et Persistance du Login

Ce document détaille comment StudyLink stocke les informations de l'utilisateur en mémoire et comment la session est maintenue après un rafraîchissement de page.

## 1. Stockage de l'Utilisateur (UserContext)

L'état de l'utilisateur est centralisé dans un contexte React (`UserContext`). Cela permet à n'importe quel composant de l'application d'accéder aux infos de l'utilisateur (nom, email, rôle, etc.) sans passer par les props.

### Définition du Contexte (`src/constant.ts`)
Le contexte est initialisé avec une valeur par défaut vide.
```typescript
export const UserContext = createContext<UserContextProps>({setUser: ()=>{}});
```

### Fournisseur de Contexte (`src/components/layout/userContextProvider.tsx`)
Le `UserContextProvider` utilise le hook `useState` pour maintenir l'objet `user` en mémoire.
```tsx
export function UserContextProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>({});

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}
```

### Hook pour accéder à l'utilisateur (`src/components/layout/userContext.tsx`)
Un court hook `useUser` simplifie l'accès au contexte dans les composants.
```typescript
export function useUser() {
    return useContext(UserContext);
}
```

## 2. Persistance de la Session (PersistLogin & RequireAuth)

Comme l'état React (`user`) est réinitialisé à chaque actualisation du navigateur (F5), nous devons "récupérer" la session de l'utilisateur automatiquement.

### Mécanisme de Persistance
StudyLink utilise deux approches complémentaires pour garantir que l'utilisateur reste connecté :

#### A. Le composant `PersistLogin` (`src/context/PersistLogin.tsx`)
Ce composant agit comme un wrapper de route. Son rôle est de déclencher un rafraîchissement du token au montage si l'état `user` est vide.
```tsx
function PersistLogin () {
    const refresh = useRefreshToken();
    const {user} = useUser();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyRefreshToken = async () => {
            try {
                // Invalide les requêtes Query pour forcer le fetch des données user
                await queryClient.invalidateQueries({ queryKey: ['user'] });
            } finally {
                setIsLoading(false);
            }
        }
        
        // Si on n'a pas d'email (user non chargé), on vérifie le refresh token
        if (!user!.email) {
            verifyRefreshToken();
        } else {
            setIsLoading(false);
        }
    }, [user?.email, refresh]);

    return isLoading ? <Loader /> : <Outlet />;
}
```

#### B. La Garde `RequireAuth` (`src/context/RequireAuth.tsx`)
En plus de protéger les routes, `RequireAuth` authentifie l'utilisateur via l'endpoint `/user/me`. C'est cet appel qui remplit réellement l'objet `user` dans le contexte si un cookie de session valide existe.
```tsx
const verifyRefreshToken = async () => {
    try {
        const response = await axiosPrivate.get('user/me')
        const userData = response.data.data.user;
        setUser(userData) // On stocke l'user récupéré dans le contexte
    } catch (error) {
        console.error('Session expirée');
    } finally {
        setIsLoading(false);
    }
}
```

## 3. Flux d'Authentification Résumé

1.  **Login** : L'utilisateur se connecte, le backend envoie un cookie `HttpOnly` (Access/Refresh Token).
2.  **State** : L'objet `user` est mis à jour dans `UserContext`.
3.  **Refresh (F5)** : L'état React est perdu.
4.  **Persist/Auth Guard** : Le composant `RequireAuth` ou `PersistLogin` s'exécute, appelle `/user/me` ou `/refresh`.
5.  **Re-Hydration** : Le backend vérifie le cookie, renvoie les infos user, et `setUser` remplit à nouveau le contexte.

## 4. Pourquoi utiliser des Cookies vs LocalStorage ?
- **Sécurité** : Les tokens dans les cookies `HttpOnly` ne sont pas accessibles via JavaScript, ce qui protège contre les attaques XSS.
- **Transparence** : Les cookies sont envoyés automatiquement par le navigateur avec `withCredentials: true`, simplifiant la logique côté client.
