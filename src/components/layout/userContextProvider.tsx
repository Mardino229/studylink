import { type ReactNode, useState} from "react";
import { UserContext } from "../../constant";
import type { User } from "../../utils/type";


export function UserContextProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<User>({});

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}