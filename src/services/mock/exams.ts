import type {BankExamMeta, ExamResult, ExamSpec, GeneratedExam, QuestionType} from "../../types/exams";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const mockCourses = [
  { id: "c-phy", name: "Physique" },
  { id: "c-bio", name: "Biologie" },
  { id: "c-eng", name: "Anglais" },
];

export async function listChapters(courseId: string): Promise<string[]> {
  await delay(200);
  const base = {
    "c-phy": ["Cinematique", "Dynamique", "Energie"],
    "c-bio": ["Cellule", "ADN", "Enzymes"],
    "c-eng": ["Grammar", "Tenses", "Vocabulary"],
  } as Record<string, string[]>;
  return base[courseId] ?? [];
}

export async function generateExam(spec: ExamSpec): Promise<GeneratedExam> {
  await delay(600);
  let counter = 1;
  const questions = spec.questions.flatMap((q) =>
    Array.from({ length: q.count }).map(() => ({
      id: `q-${counter++}`,
      type: q.type as QuestionType,
      prompt: q.type === "qcm" ? "Which option is correct?" : "Explain the concept briefly.",
      choices: q.type === "qcm" ? ["A", "B", "C", "D"] : undefined,
      answer: q.type !== "qcm" ? "Sample expected answer." : undefined,
      explanation: "This is a placeholder explanation for the generated question.",
    }))
  );
  return {
    id: `exam-${Date.now()}`,
    createdAt: new Date().toISOString(),
    spec,
    questions,
  };
}

export async function gradeExam(examId: string, userAnswers: Record<string, string>): Promise<ExamResult> {
  await delay(500);
  const entries = Object.entries(userAnswers);
  const correctCount = Math.floor(entries.length * 0.7);
  const details = entries.map(([questionId], i) => ({
    questionId,
    correct: i < correctCount,
    userAnswer: userAnswers[questionId],
    correctAnswer: i < correctCount ? userAnswers[questionId] : "Expected different answer",
    explanation: "Mock correction details.",
  }));
  return {
    examId,
    score: Math.round((correctCount / Math.max(1, entries.length)) * 100),
    details,
  };
}

export async function listBank(): Promise<BankExamMeta[]> {
  await delay(250);
  return [
    { id: "b1", title: "Physique S1 - Examen final", faculty: "Sciences", program: "Physique", year: "2024" },
    { id: "b2", title: "Biologie S2 - Partiel", faculty: "Sciences", program: "Biologie", year: "2023" },
  ];
}

export async function submitBankItem(meta: Omit<BankExamMeta, "id">, file?: File): Promise<{ id: string }>{
  await delay(400);
  return { id: `b-${Date.now()}` };
}
