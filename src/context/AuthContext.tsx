
import {createContext, useState} from "react";
import type {User} from "../utils/type.ts";


export interface AuthContextType {
    auth: User;
    setAuth: (auth: User) => void;
}

const AuthContext = createContext<AuthContextType>({
    auth: {},
    setAuth: () => {},
});

export function AuthProvider({children}: {children: React.ReactNode}) {

    const [auth, setAuth] = useState<User>({});

    return (
        <AuthContext.Provider value={{auth, setAuth}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
