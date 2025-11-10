export interface MCQOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: number;
    type: "mcq" | "text";
    question: string;
    options?: MCQOption[];
    correctAnswer?: string;
    explanation?: string;
}

export interface QuizAnswer {
    questionId: number;
    answer: string;
}

export interface QuestionResult {
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer?: string;
}

export const quizData: Question[] = [
    {
        id: 1,
        type: "mcq",
        question: "Quelle est la capitale de la France ?",
        options: [
            { id: "a", text: "Londres", isCorrect: false },
            { id: "b", text: "Paris", isCorrect: true },
            { id: "c", text: "Berlin", isCorrect: false },
            { id: "d", text: "Madrid", isCorrect: false }
        ],
        explanation: "Paris est la capitale et la plus grande ville de France depuis le Moyen Âge."
    },
    {
        id: 2,
        type: "text",
        question: "Combien font 15 × 8 ?",
        correctAnswer: "120",
        explanation: "15 × 8 = 120. On peut aussi calculer: (10 × 8) + (5 × 8) = 80 + 40 = 120"
    },
    {
        id: 3,
        type: "mcq",
        question: "Qui a écrit 'Les Misérables' ?",
        options: [
            { id: "a", text: "Émile Zola", isCorrect: false },
            { id: "b", text: "Victor Hugo", isCorrect: true },
            { id: "c", text: "Gustave Flaubert", isCorrect: false },
            { id: "d", text: "Alexandre Dumas", isCorrect: false }
        ],
        explanation: "Victor Hugo a écrit 'Les Misérables' en 1862, l'un des romans les plus célèbres de la littérature française."
    },
    {
        id: 4,
        type: "text",
        question: "Quelle est la formule chimique de l'eau ?",
        correctAnswer: "H2O",
        explanation: "L'eau est composée de deux atomes d'hydrogène (H) et d'un atome d'oxygène (O), d'où H₂O."
    },
    {
        id: 5,
        type: "mcq",
        question: "En quelle année a eu lieu la Révolution française ?",
        options: [
            { id: "a", text: "1789", isCorrect: true },
            { id: "b", text: "1792", isCorrect: false },
            { id: "c", text: "1804", isCorrect: false },
            { id: "d", text: "1815", isCorrect: false }
        ],
        explanation: "La Révolution française a commencé en 1789 avec la prise de la Bastille le 14 juillet."
    }
];

export const getQuestionResult = (question: Question, userAnswer: string): QuestionResult => {
    if (!userAnswer) return { isCorrect: false, userAnswer: "Pas de réponse" };
    
    if (question.type === "mcq") {
        const correctOption = question.options?.find(opt => opt.isCorrect);
        const selectedOption = question.options?.find(opt => opt.id === userAnswer);
        return {
            isCorrect: userAnswer === correctOption?.id,
            userAnswer: selectedOption?.text || "Réponse inconnue",
            correctAnswer: correctOption?.text
        };
    } else {
        const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
        return {
            isCorrect,
            userAnswer,
            correctAnswer: question.correctAnswer
        };
    }
};