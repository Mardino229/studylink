import { useMutation } from '@tanstack/react-query';
import { axiosClient } from "./api.ts";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/layout/userContext.tsx";
import type { LoginFormRequest, RegisterFormRequest, ValidationError } from "./type.ts";
import type { AxiosError } from "axios";


const useLogin = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const { mutate, isPending } = useMutation({
        mutationFn: async (data: LoginFormRequest) => {
            const response = await axiosClient.post('auth/login', data)
            const userData = response.data.data.user;
            console.log(userData)
            setUser(userData)
            console.log(response.data)
            return {
                success: true,
                user: userData,
            };
        },
        onSuccess: (data) => {

            toast.success('Connexion réussie', {
                description: "Welcome back !",
            });

            if (data.user.is_active) {
                if (data.user.role?.name === 'admin') {
                    navigate('/admin/home');
                } else if (data.user.study_level_id === null) {
                    navigate('/complete-profile');
                } else {
                    navigate(`/home`);
                }
            } else {
                navigate(`/confirm`);
            }
        },
        onError: (error) => {
            console.error(error);

            const axiosError = error as AxiosError;

            if (!axiosError.response) {
                toast.error("Login failed", {
                    description: "Service unavailable. Please try again later.",
                });
                return;
            }

            const err = error as unknown as {
                response: {
                    data: {
                        detail: string
                    },
                    status: number,
                };
            }
            if (err.response.status === 403) {
                const err = error as unknown as {
                    response: {
                        data: {
                            detail: {
                                message: string,
                                email: string
                            }
                        },
                        status: number,
                    };
                }
                toast.error("Please validate your account", {
                    description: err.response.data.detail.message,
                });
                navigate(`/confirm?email=${err.response.data.detail.email}`);
            } else {
                toast.error("Connexion failed", {
                    description: err.response.data.detail,
                });
            }
            return {
                success: false,
                message: error.message,
            };
        },
    })
    return { mutate, isPending };
}

const useRegister = () => {

    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (data: RegisterFormRequest) => {
            const response = await axiosClient.post('/auth/register', data)
            toast.success(response.data.message, {
                description: "We have received a code to verify your account.",
            })
            navigate(`/confirm?email=${data.email}`);
        },
        onSuccess: () => {
            // Optionnel: vous pouvez mettre du code ici si nécessaire
        },
        onError: (error) => {
            console.error(error);

            const axiosError = error as AxiosError;

            if (!axiosError.response) {
                toast.error("Inscription failed", {
                    description: "Service unavailable. Please try again later.",
                });
                return;
            }

            // Si on arrive ici, on a une réponse du serveur
            const err = error as unknown as {
                response: {
                    data: {
                        detail: string | ValidationError[]
                    },
                    status: number,
                };
            };

            if (err.response.status === 422) {
                const validationErr = error as unknown as {
                    response: {
                        data: {
                            detail: ValidationError[]
                        }
                    };
                };
                toast.error("Inscription failed", {
                    description: `${validationErr.response.data.detail[0].loc[1]}: ${validationErr.response.data.detail[0].msg}`,
                });
            } else {
                toast.error("Inscription failed", {
                    description: typeof err.response.data.detail === 'string'
                        ? err.response.data.detail
                        : "An error occurred",
                });
            }


        },
    });
}

const useVerify = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: async (data: { email: string | null; otp: string; }) => {
            const response = await axiosClient.post('/auth/verify-otp', data)
            toast.success(response.data.message, {
                description: "Your account have been verified",
            })
        },
        onSuccess: () => {
            navigate(`/login`);
        },
        onError: (error) => {

            const axiosError = error as AxiosError;

            if (!axiosError.response) {
                toast.error("Operation failed", {
                    description: "Service unavailable. Please try again later.",
                });
                return;
            }

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
                toast.error("Validation failed", {
                    description: `${err.response.data.detail[0].loc[1]}: ${err.response.data.detail[0].msg}`,
                })
            } else {
                toast.error("Validation failed", {
                    description: err.response.data.detail,
                })
            }
        },
    })
}

const useLogout = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    return useMutation({
        mutationFn: async () => {
            await axiosClient.post('/auth/logout ');
            setUser({})
            toast.success("Logout successful")
        },
        onSuccess: () => {
            navigate(`/`);
        },
        onError: (error) => {
            const axiosError = error as AxiosError;
            if (!axiosError.response) {
                toast.error("Logout failed", {
                    description: "Service unavailable. Please try again later.",
                });
                return;
            }
        }
    });
};

const useRequestPassword = () => {
    return useMutation({
        mutationFn: async (data: { to_email: string }) => {
            const response = await axiosClient.post('/auth/request-password-reset', data);
            toast.success(response.data.message, {
                description: "We've sent a reset password link to your email",
            })
        },
        onSuccess: () => {

        },
        onError: (error) => {
            console.error(error);

            const axiosError = error as AxiosError;

            if (!axiosError.response) {
                toast.error("Operation failed", {
                    description: "Service unavailable. Please try again later.",
                });
                return;
            }

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
                toast.error("Password Request failed", {
                    description: `${err.response.data.detail[0].loc[1]}: ${err.response.data.detail[0].msg}`,
                })
            } else {
                toast.error("Password Request failed", {
                    description: err.response.data.detail,
                })
            }
        }
    });
};

const useResetPassword = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (data: { token: string | null, password: string, confirmPassword: string }) => {
            const response = await axiosClient.post('/auth/reset-password', data);
            toast.success(response.data.message, {
                description: "You can log you in with your new password",
            })
        },
        onSuccess: () => {
            navigate(`/login`);
        },
        onError: (error) => {
            console.error(error);

            const axiosError = error as AxiosError;

            if (!axiosError.response) {
                toast.error("Operation failed", {
                    description: "Service unavailable. Please try again later.",
                });
                return;
            }

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
                toast.error("Password Reset failed", {
                    description: `${err.response.data.detail[0].loc[1]}: ${err.response.data.detail[0].msg}`,
                })
            } else {
                toast.error("Password Reset failed", {
                    description: err.response.data.detail,
                })
            }
        }
    });
};


export { useLogin, useRegister, useVerify, useLogout, useRequestPassword, useResetPassword };
