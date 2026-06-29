export type ExamSession = 'fall' | 'winter' | 'summer';
export type ExamType = 'midterm' | 'final' | 'quiz' | 'other';

export type Course = {
    id: string;
    code: string;
    name: string;
    faculty_id?: string | null;
};

export type ExamItem = {
    id: string;
    name: string;
    course_id?: string | null;
    course?: Course | null;
    program_id?: string | null;
    study_level_id?: string | null;
    academic_year?: number | null;
    session?: ExamSession | null;
    exam_type?: ExamType | null;
    is_solution_paid: boolean;
    exam_file_url?: string | null;
    solution_file_url?: string | null;
    is_validated: boolean;
    creation_date?: string;
    creator_user_id?: string;
};

export type ExamFilters = {
    faculty_id?: string;
    program_id?: string;
    course_id?: string;
    study_level_id?: string;
    academic_year?: number;
    session?: ExamSession;
    exam_type?: ExamType;
    is_validated?: boolean;
    skip?: number;
    limit?: number;
};
