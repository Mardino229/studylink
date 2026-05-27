import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "./api.ts";

export type StudyLevel = {
    id: string;
    name: string;
}

export type Faculty = {
    id: string;
    name: string;
}

export type Program = {
    id: string;
    name: string;
    faculty_id?: string;
}

const StudyLevels = () => {
    const { data, isPending, isError } = useQuery({
        queryFn: async (): Promise<StudyLevel[]> => {
            const response = await axiosClient.get<{ data: StudyLevel[] }>('school/study-levels')
            return response.data.data;
        },
        queryKey: ['study_levels'],
    })

    return { data, isPending, isError };
}

const Faculties = () => {
    const { data, isPending, isError } = useQuery({
        queryFn: async (): Promise<Faculty[]> => {
            const response = await axiosClient.get<{ data: Faculty[] }>('school/faculties')
            return response.data.data
        },
        queryKey: ['faculties'],
    })

    return { data, isPending, isError };
}

const Programs = () => {
    const { data, isPending, isError } = useQuery({
        queryFn: async (): Promise<Program[]> => {
            const response = await axiosClient.get<{ data: Program[] }>(`school/programs`)
            return response.data.data
        },
        queryKey: ['programs'],
    })

    return { data, isPending, isError };
}

const ProgramsByFaculty = (id: string) => {
    const { data, isPending, isError } = useQuery({
        queryFn: async (): Promise<Program[]> => {
            const response = await axiosClient.get<{ data: Program[] }>(`school/programs/${id}`)
            return response.data.data
        },
        queryKey: ['programs', id],
    })

    return { data, isPending, isError };
}

export { StudyLevels, Faculties, Programs, ProgramsByFaculty }
