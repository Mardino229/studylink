import { CheckIcon, Loader, XCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { STEPS } from "../../constant.ts";

export const StepTracker = ({ courseId }: { courseId: string }) => {
    const { data: status } = useQuery<string|{ id: string, message: string, error: boolean }>({
        queryKey: ["summary-status", courseId],
        enabled: false,
    });


    // On gère les deux formats possibles (string au début ou objet ensuite)
    const activeStepId = typeof status === "string" ? status : status?.id;
    const isError = typeof status === "object" && status?.error;

    const activeIndex = STEPS.findIndex(s => s.id === activeStepId);
    const finalIndex = activeStepId === "complete" ? 99 : activeIndex;

    return (
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
            {STEPS.map((step, index) => {
                const isCompleted = index < finalIndex;
                const isCurrent = index === finalIndex;
                const hasErrorAtThisStep = isCurrent && isError;

                return (
                    <div key={step.id} className="flex flex-col gap-1">
                        <div className={`flex items-center justify-between transition-all duration-500 ${
                            isCurrent ? "opacity-100 scale-105" : "opacity-30"
                        }`}>
                            <span className={`text-sm font-medium ${hasErrorAtThisStep ? "text-red-600" : "text-gray-700"}`}>
                                {step.label}
                            </span>

                            <div className="flex items-center">
                                {isCompleted && <CheckIcon className="w-5 h-5 text-green-500" />}

                                {isCurrent && !isError && <Loader className="w-5 h-5 text-blue-500 animate-spin" />}

                                {hasErrorAtThisStep && <XCircle className="w-5 h-5 text-red-500 animate-bounce" />}
                            </div>
                        </div>

                        {/* Message d'erreur spécifique à l'étape */}
                        {hasErrorAtThisStep && (
                            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2 rounded mt-1 border border-red-100">
                                <AlertCircle className="w-3 h-3" />
                                <span>{status?.message || "Échec de cette étape"}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};