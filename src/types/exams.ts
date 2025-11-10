export type QuestionType = "qcm" | "short" | "long" | "truefalse";

export type CourseChapter = {
  id: string;
  courseName: string;
  chapterTitle: string;
};

export type ExamSpec = {
  items: { courseId: string; courseName: string; chapters: string[] }[];
  questions: { type: QuestionType; count: number }[];
};

export type GeneratedQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  choices?: string[]; // for qcm
  answer?: string;    // for open/truefalse
  explanation?: string;
};

export type GeneratedExam = {
  id: string;
  createdAt: string;
  spec: ExamSpec;
  questions: GeneratedQuestion[];
};

export type ExamResultItem = {
  questionId: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer?: string;
  explanation?: string;
};

export type ExamResult = {
  examId: string;
  score: number; // 0..100
  details: ExamResultItem[];
};

export type BankExamMeta = {
  id: string;
  title: string;
  faculty?: string;
  program?: string;
  year?: string;
};
