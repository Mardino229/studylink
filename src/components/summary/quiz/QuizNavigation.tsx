import {ArrowRightIcon, AngleLeftIcon} from "../../../icons";
import Button from "../../ui/button/Button.tsx";


interface QuizNavigationProps {
    currentQuestion: number;
    isLastQuestion: boolean;
    canProceed: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

export default function QuizNavigation({
    currentQuestion,
    isLastQuestion,
    canProceed,
    onPrevious,
    onNext
}: QuizNavigationProps) {
    return (
        <div className="flex justify-end items-center sm:justify-between gap-4">
            <Button
                variant="outline"
                onClick={onPrevious}
                disabled={currentQuestion === 0}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <AngleLeftIcon/>
            </Button>

            <div className="flex items-center gap-3">
                <Button
                    onClick={onNext}
                    disabled={!canProceed}
                    className=" disabled:text-gray-500 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                    {isLastQuestion ? "Terminer" : <ArrowRightIcon/>}
                </Button>
            </div>
        </div>
    );
}