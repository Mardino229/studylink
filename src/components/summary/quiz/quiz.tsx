import { useState, useEffect } from "react";
import QuestionCard from "./QuestionCard.tsx";
import QuizNavigation from "./QuizNavigation.tsx";
import QuizResults from "./QuizResults.tsx";
import QuizHeader from "./QuizHeader.tsx";
import type { Quiz as QuizType, QuizQuestion } from "../../../utils/summary.ts";

interface QuizProps {
    quizzes: QuizType[];
}

export default function Quiz({ quizzes }: QuizProps) {
    // Extraire toutes les questions de tous les quizzes
    const quizData: QuizQuestion[] = quizzes.flatMap(quiz => quiz.questions);
    
    // Si aucun quiz n'est disponible, afficher un message
    if (!quizzes || quizzes.length === 0 || quizData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-md">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Aucun quiz disponible
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Les quiz n'ont pas encore été générés pour ce résumé. Veuillez réessayer plus tard.
                    </p>
                </div>
            </div>
        );
    }
    
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string>("");
    const [textAnswer, setTextAnswer] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [quizFinished, setQuizFinished] = useState(false);
    const [showRecapDrawer, setShowRecapDrawer] = useState(false);

    // Timer
    useEffect(() => {
        if (timeLeft > 0 && !quizFinished) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            handleFinishQuiz();
        }
    }, [timeLeft, quizFinished]);

    const currentQuestionData = quizData[currentQuestion];
    const isLastQuestion = currentQuestion === quizData.length - 1;

    const handleAnswerSelect = (answerId: string) => {
        setSelectedAnswer(answerId);
    };

    const handleTextChange = (value: string) => {
        setTextAnswer(value);
    };

    const handleNext = () => {
        // Sauvegarder la réponse
        const answer = currentQuestionData.type === "mcq" ? selectedAnswer : textAnswer;
        setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));

        if (isLastQuestion) {
            handleFinishQuiz();
        } else {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer("");
            setTextAnswer("");
            setShowResult(false);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
            const prevAnswer = answers[currentQuestion - 1] || "";
            
            if (quizData[currentQuestion - 1].type === "mcq") {
                setSelectedAnswer(prevAnswer);
                setTextAnswer("");
            } else {
                setTextAnswer(prevAnswer);
                setSelectedAnswer("");
            }
            setShowResult(false);
        }
    };


    const handleFinishQuiz = () => {
        // Calculer le score final
        let finalScore = 0;
        const finalAnswers = { ...answers };
        
        // Ajouter la réponse actuelle
        const currentAnswer = currentQuestionData.type === "mcq" ? selectedAnswer : textAnswer;
        if (currentAnswer) {
            finalAnswers[currentQuestion] = currentAnswer;
        }

        quizData.forEach((question, index) => {
            const userAnswer = finalAnswers[index];
            if (question.type === "mcq") {
                if (userAnswer && userAnswer === question.correct_answer) {
                    finalScore++;
                }
            } else {
                // Pour les questions ouvertes, on peut faire une validation simple
                if (userAnswer && question.answer && 
                    userAnswer.toLowerCase().includes(question.answer.toLowerCase().substring(0, 50))) {
                    finalScore++;
                }
            }
        });

    setScore(finalScore);
    setQuizFinished(true);
    setShowRecapDrawer(false);
    };

    const handleRestart = () => {
        setCurrentQuestion(0);
        setSelectedAnswer("");
        setTextAnswer("");
        setShowResult(false);
        setAnswers({});
        setScore(0);
        setTimeLeft(300);
        setQuizFinished(false);
    };

    const canProceed = () => {
        if (currentQuestionData.type === "mcq") {
            return selectedAnswer !== "";
        } else {
            return textAnswer.trim() !== "";
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 relative">
            {/* Quiz questions and navigation only if not finished */}
            {!quizFinished && (
                <>
                    <QuizHeader
                        currentQuestion={currentQuestion}
                        totalQuestions={quizData.length}
                    />
                    <QuestionCard
                        question={currentQuestionData}
                        selectedAnswer={selectedAnswer}
                        textAnswer={textAnswer}
                        showResult={showResult}
                        onAnswerSelect={handleAnswerSelect}
                        onTextChange={handleTextChange}
                    />

                    <QuizNavigation
                        currentQuestion={currentQuestion}
                        isLastQuestion={isLastQuestion}
                        canProceed={canProceed()}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                    />
                </>
            )}

            {/* Show result summary after quiz is finished, replacing quiz content */}
            {quizFinished && (
                <div className="mt-8">
                    <QuizResults score={score} total={quizData.length} answers={answers} questions={quizData} onRestart={handleRestart} onOpenRecap={() => setShowRecapDrawer(true)} />
                </div>
            )}

            {/* Drawer for recap, only when showRecapDrawer is true */}
            {showRecapDrawer && (
                <>
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm z-40 transition-opacity" />
                    {/* Drawer */}
                    <div className="fixed left-0 right-0 bottom-0 z-50 flex justify-center max-h-[80vh]">
                        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl px-6 animate-slide-up relative overflow-hidden flex flex-col">
                            {/* Close button */}
                            <button
                                className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-2xl"
                                aria-label="Fermer le récapitulatif"
                                onClick={() => setShowRecapDrawer(false)}
                            >
                                &times;
                            </button>
                            {/* Only the detailed recap */}
                            <div className="flex-1 overflow-y-auto mt-8">
                                <QuizResults
                                    score={score}
                                    total={quizData.length}
                                    answers={answers}
                                    questions={quizData}
                                    onRestart={handleRestart}
                                    showOnlySummary
                                    onCloseRecap={() => setShowRecapDrawer(false)}
                                />
                            </div>
                        </div>
                    </div>
                    <style>{`
                        @keyframes slide-up {
                            from { transform: translateY(100%); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                        .animate-slide-up {
                            animation: slide-up 0.4s cubic-bezier(.4,0,.2,1);
                        }
                    `}</style>
                </>
            )}
        </div>
    );
}