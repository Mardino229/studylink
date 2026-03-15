

interface QuizHeaderProps {
    currentQuestion: number;
    totalQuestions: number;
}

export default function QuizHeader({ currentQuestion, totalQuestions }: QuizHeaderProps) {
    return (
        <div className="relative mb-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Question {currentQuestion + 1} sur {totalQuestions}
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%
                </span>
            </div>
            
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                />
            </div>
        </div>
    );
}