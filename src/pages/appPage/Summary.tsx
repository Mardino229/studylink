import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import SummaryTabs from "../../components/summary/summary.tsx";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSummary } from "../../utils/summary.ts";
import { ArrowLeft } from "lucide-react";

export default function Summary() {
    const { courseId, courseName, summaryId } = useParams();
    const navigate = useNavigate();
    const { data: summary, isLoading } = useGetSummary(summaryId);
    
    const currentCourseName = courseName ? decodeURIComponent(courseName) : "";

    if (isLoading) {
        return (
            <>
                <PageMeta
                    title="Chargement..."
                    description="Loading summary details"
                />
                <PageBreadcrumb 
                    pageTitle="Chargement..."
                    items={[
                        { label: "My Courses", path: "/my-courses" },
                        { label: currentCourseName, path: `/my-courses/${courseId}/${courseName}/summaries` }
                    ]}
                />
                <div className="space-y-6 pt-8">
                    <p className="text-center text-gray-500">Chargement du résumé...</p>
                </div>
            </>
        );
    }

    if (!summary) {
        return (
            <>
                <PageMeta
                    title="Résumé introuvable"
                    description="Summary not found"
                />
                <PageBreadcrumb 
                    pageTitle="Résumé introuvable"
                    items={[
                        { label: "My Courses", path: "/my-courses" },
                        { label: currentCourseName, path: `/my-courses/${courseId}/${courseName}/summaries` }
                    ]}
                />
                <div className="space-y-6 pt-8">
                    <p className="text-center text-gray-500">Résumé introuvable</p>
                </div>
            </>
        );
    }

    return (
        <>
            <PageMeta
                title={summary.summary_name || "Summary"}
                description="This is your summary detail"
            />
            <PageBreadcrumb 
                pageTitle={summary.summary_name || "My Summary"}
                items={[
                    { label: "My Courses", path: "/my-courses" },
                    { label: currentCourseName, path: `/my-courses/${courseId}/${courseName}/summaries` }
                ]}
            />

            <div className="space-y-6 pt-8">
                <button
                    onClick={() => navigate(`/my-courses/${courseId}/${courseName}/summaries`)}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden xs:inline sm:inline">Retour aux résumés</span>
                    <span className="inline xs:hidden sm:hidden">Retour</span>
                </button>
                <SummaryTabs summary={summary} />
            </div>

        </>
    );
}
