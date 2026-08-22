import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUser } from "../components/layout/userContext.tsx";
import { useNavigate } from "react-router-dom";
import type { CompleteProfileRequest, UpdateProfileRequest, UpdatePasswordRequest, ValidationError, User } from "./type.ts";
import { useAxiosPrivate } from "../hoooks/useAxiosPrivate.ts";


const useMe = () => {
    const { setUser } = useUser();
    const axiosPrivate = useAxiosPrivate();

    const { data: me, isPending, isError } = useQuery({
        queryFn: async () => {
            const response = await axiosPrivate.get<{ data: { user: User } }>('user/me')
            const userData = response.data.data.user;
            console.log(userData)
            setUser(userData)
            toast('Welcome back !');
            return {
                success: true,
                user: userData,
            };
        },
        queryKey: ['user'],
    })
    return { me, isPending, isError };
}


const useCompleteProfile = () => {

    const navigate = useNavigate();
    const { setUser } = useUser();
    const axiosPrivate = useAxiosPrivate();

    return useMutation({
        mutationFn: async (data: CompleteProfileRequest) => {
            const response = await axiosPrivate.patch<{ data: { user: User }, message: string }>('/user/complete-profile', data)
            toast.success(response.data.message, {
                description: "Profile completed successfully",
            })
            return response.data.data.user;
        },
        onSuccess: (userData) => {
            setUser(userData);
            navigate('/onboarding');
        },
        onError: (error) => {
            console.error(error);
            const err = error as unknown as {
                response: {
                    data: {
                        detail: string
                    },
                    status: number,
                };
            }
            console.log(err.response.status === 422)
            if (err.response.status === 422) {
                const err = error as unknown as {
                    response: {
                        data: {
                            detail: ValidationError[]
                        }
                    };
                }
                toast.error("Operation failed", {
                    description: `${err.response.data.detail[0].loc[1]}: ${err.response.data.detail[0].msg}`,
                })
            } else {
                toast.error("Operation failed", {
                    description: err.response.data.detail,
                })
            }
        },
    }
    );
}

const useUpdateProfile = () => {
    const { setUser } = useUser();
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateProfileRequest) => {
            const response = await axiosPrivate.patch<{ data: { user: User } }>('/user/update-profile', data);
            return response.data.data.user;
        },
        onSuccess: (userData) => {
            setUser(userData);
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast.success("Profile updated successfully", {
                description: "Your information has been updated",
            });
        },
        onError: (error) => {
            console.error(error);
            const err = error as unknown as {
                response: {
                    data: {
                        detail: string | ValidationError[]
                    },
                    status: number,
                };
            }
            if (err.response.status === 422) {
                const validationErr = error as unknown as {
                    response: {
                        data: {
                            detail: ValidationError[]
                        }
                    };
                }
                toast.error("Validation error", {
                    description: `${validationErr.response.data.detail[0].loc[1]}: ${validationErr.response.data.detail[0].msg}`,
                })
            } else {
                const errDetail = err.response.data.detail as string;
                toast.error("Update failed", {
                    description: errDetail,
                })
            }
        },
    });
}


const useRequestPasswordOTP = () => {
    const axiosPrivate = useAxiosPrivate();

    return useMutation({
        mutationFn: async () => {
            const response = await axiosPrivate.post<{ message: string }>('/user/request-change-password-otp');
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Un code OTP a été envoyé à votre email.");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Échec de l'envoi de l'OTP");
        },
    });
}

const useUpdatePassword = () => {
    const axiosPrivate = useAxiosPrivate();

    return useMutation({
        mutationFn: async (data: UpdatePasswordRequest) => {
            const response = await axiosPrivate.post<{ message: string }>('/user/change-password', data);
            return response.data;
        },
        onSuccess: (data: { message: string }) => {
            toast.success(data.message || "Mot de passe mis à jour avec succès");
        },
        onError: (error) => {
            console.error(error);
            const err = error as unknown as {
                response: {
                    data: {
                        detail: string | ValidationError[]
                    },
                    status: number,
                };
            }
            if (err.response.status === 422) {
                const validationErr = error as unknown as {
                    response: {
                        data: {
                            detail: ValidationError[]
                        }
                    };
                }
                toast.error("Erreur de validation", {
                    description: `${validationErr.response.data.detail[0].loc[1]}: ${validationErr.response.data.detail[0].msg}`,
                })
            } else {
                const errDetail = err.response.data.detail as string;
                toast.error("Échec de la mise à jour", {
                    description: errDetail,
                })
            }
        },
    });
}

export { useMe, useCompleteProfile, useUpdateProfile, useRequestPasswordOTP, useUpdatePassword, useUser };