import {createContext} from "react";
import type {UserContextProps} from "./utils/type.ts";



export const UserContext = createContext<UserContextProps>({setUser: ()=>{}});
