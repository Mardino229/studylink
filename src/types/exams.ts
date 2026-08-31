export type ExamSession = 'fall' | 'winter' | 'summer';
export type ExamType = 'Mi-session' | 'Final' | 'Quiz' | 'Devoir' | 'Pratique' | 'DGD' | 'Autre';
export type SubmissionStatus = 'pending' | 'validated' | 'rejected';

export type Course = {
    id: string;
    code_fr?: string;
    name_fr?: string;
    code_en?: string;
    name_en?: string;
    faculty_id?: string | null;
};

export function courseCode(c: Course, lang = 'fr'): string {
    if (lang.startsWith('fr')) return c.code_fr ?? c.code_en ?? '';
    return c.code_en ?? c.code_fr ?? '';
}

export function courseName(c: Course, lang = 'fr'): string {
    if (lang.startsWith('fr')) return c.name_fr ?? c.name_en ?? '';
    return c.name_en ?? c.name_fr ?? '';
}

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
    is_exam_paid: boolean;
    is_solution_paid: boolean;
    type_number?: number | null;
    section?: string | null;
    exam_file_url?: string | null;
    solution_file_url?: string | null;
    solution_creator_user_id?: string;
    submission_status: SubmissionStatus;
    admin_note?: string | null;
    creation_date?: string;
    creator_user_id?: string;
    has_exam_access: boolean;
    has_solution_access: boolean;
};

export type SolutionSubmission = {
    id: string;
    exam_id: string;
    exam?: Pick<ExamItem, 'id' | 'name' | 'course' | 'academic_year'> | null;
    solution_file_url: string;
    submission_status: SubmissionStatus;
    admin_note?: string | null;
    submitted_at: string;
    creator_user_id?: string;
};

export type ExamFileSubmissionRead = {
    id: string;
    exam_id: string;
    exam?: Pick<ExamItem, 'id' | 'name' | 'course' | 'academic_year'> | null;
    exam_file_url: string;
    submission_status: SubmissionStatus;
    admin_note?: string | null;
    coins_rewarded: boolean;
    submitted_at: string;
    reviewed_at?: string;
};

export type CoinTransaction = {
    id: string;
    amount: number;
    type: 'earned' | 'converted';
    description: string | null;
    created_at: string;
};

export type ExamFilters = {
    faculty_id?: string;
    program_id?: string;
    course_id?: string;
    study_level_id?: string;
    academic_year?: number;
    session?: ExamSession;
    exam_type?: ExamType;
    type_number?: number;
    section?: string;
    submission_status?: SubmissionStatus;
    skip?: number;
    limit?: number;
    language?: 'fr' | 'en';
};
