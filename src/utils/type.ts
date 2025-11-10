import type {Dispatch, SetStateAction} from "react";

export interface ValidationError {
    type: string;
    loc: string[];
    msg: string;
}

export type CompleteProfileRequest = {
    first_name: string; last_name: string; study_level_id: string; faculty_id?: string; program_id?: string; other_program?: boolean; program_name?: string
}

export type LoginFormRequest = {
    email: string;
    password: string;
}

export type RegisterFormRequest = {
    email: string;
    password: string;
    confirmPassword: string;
}

export type User = {
    first_name?: string;
    last_name?: string;
    email?: string;
    receiver?: string;
    is_active?: boolean;
    other_program?: boolean;
    study_level_id?: number | null;
    faculty_id?: number | null;
    program_id?: number | null;
}

export type UserContextProps = {
    user?: User;
    setUser: Dispatch<SetStateAction<User>>;
};