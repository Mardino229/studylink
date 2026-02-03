import { FileText, Calendar, Building2, BookOpen, Download } from "lucide-react";
import type { BankExamMeta } from "../../types/exams";

interface ExamCardProps {
    exam: BankExamMeta;
}

export function ExamCard({ exam }: ExamCardProps) {
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Mock download action
        const link = document.createElement('a');
        link.href = '#'; // In a real app, this would be the file URL
        link.download = `${exam.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert(`Téléchargement de ${exam.title} lancé...`);
    };

    return (
        <div className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <FileText size={20} />
                </div>
                <button
                    onClick={handleDownload}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-colors"
                    title="Télécharger"
                >
                    <Download size={20} />
                </button>
            </div>

            <div>
                <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 dark:text-white">
                        {exam.title}
                    </h3>
                </div>
                <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {exam.faculty && (
                        <span className="flex items-center gap-1.5">
                            <Building2 size={12} />
                            {exam.faculty}
                        </span>
                    )}
                    {exam.program && (
                        <span className="flex items-center gap-1.5">
                            <BookOpen size={12} />
                            {exam.program}
                        </span>
                    )}
                    {exam.year && (
                        <span className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {exam.year}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
