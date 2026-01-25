import { axiosPrivate } from "../utils/api.ts";
import {useQueryClient} from "@tanstack/react-query";

export interface ApiError {
    response?: {
        status: number;
        data: {
            detail: string;
        };
    };
}

const useRefreshToken = () => {

    const queryClient = useQueryClient();

    return async () => {
        try {
            const response = await axiosPrivate.post(
                'auth/refresh',
                {},
            );
            await queryClient.invalidateQueries({ queryKey: ['user'] });
            console.log(response)
            return
        } catch (err) {
            const error = err as ApiError;
            console.log(error);
            if (error.response?.status === 403) {
                console.log("Requête annulée :", error.response.data.detail);
            }
        }
    }
}

export default useRefreshToken;