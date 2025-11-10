import {useContext} from "react";
import AuthContext, {type AuthContextType} from "../context/AuthContext.tsx";


const useAuth = ():AuthContextType => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return <AuthContextType>useContext(AuthContext);
}
export default useAuth;


