export type ExamSession = 'fall' | 'winter' | 'summer';
export type ExamType = 'midterm' | 'final' | 'quiz' | 'other';
export type SubmissionStatus = 'pending' | 'validated' | 'rejected';

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
    is_exam_paid: boolean;
    is_solution_paid: boolean;
    exam_file_url?: string | null;
    solution_file_url?: string | null;
    submission_status: SubmissionStatus;
    admin_note?: string | null;
    creation_date?: string;
    creator_user_id?: string;
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
    submission_status?: SubmissionStatus;
    skip?: number;
    limit?: number;
};
