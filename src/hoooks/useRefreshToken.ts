import useAuth from "./useAuth.ts";
import {axiosClient} from "../utils/api.ts";

export interface ApiError {
    response?: {
        status: number;
        data: {
            detail: string;
        };
    };
}

const useRefreshToken = () => {

    const {setAuth} = useAuth();

    return async () => {
        try {
            const response = await axiosClient.post(
                '/refresh-token',
                {},
            );
            setAuth(response.data.user);
            console.log(response)
            return response.data.body.accessToken;
        } catch (err) {
            const error = err as ApiError;
            console.log(error);
            if (error.response?.status === 403) {
                console.log("Requête annulée :", error.response.data.detail);
            }
        }
    }
}

export default  useRefreshToken;