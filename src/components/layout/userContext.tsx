import {useContext} from "react";
import {UserContext} from "../../constant.ts";


export function useUser() {
    return useContext(UserContext);
}