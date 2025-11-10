import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import SummaryTabs from "../../components/summary/summary.tsx";

export default function Summary() {


    return (
        <>
            <PageMeta
                title="Summary"
                description="This is your summary list"
            />
            <PageBreadcrumb pageTitle="My Summary" />

            <div className="space-y-6 pt-8">
                <SummaryTabs />
            </div>

        </>
    );
}
