import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ProgressMetrics from "../../components/dashboard/ProgressMetrics.tsx";
import MonthlyTarget from "../../components/dashboard/MonthlyTarget.tsx";
import {Bot} from "lucide-react";
import {FileIcon} from "../../icons";
import Button from "../../components/ui/button/Button.tsx";
import UpcomingSchedule from "../../components/dashboard/UpcomingSchedule.tsx";

export default function LibrarySummary() {

    return (
        <>
            <PageMeta
                title="Library Summary"
                description="This is your dashboard"
            />
            <PageBreadcrumb pageTitle="Library My Summary" />

            <div className="grid grid-cols-12 gap-4 md:gap-6">

                <div className="col-span-12 xl:col-span-5">
                    <MonthlyTarget />
                </div>
                <div className="col-span-12 space-y-6 xl:col-span-7">
                    <ProgressMetrics />
                    <div className="bg-white border-gray-200 border-1 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">Actions
                            rapides</h2>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2 justify-between flex-wrap items-center">
                                <Button className="flex items-center ">
                                    <span
                                        className="material-icons text-subtext-light dark:text-subtext-dark"> <FileIcon classname="size-8"/> </span>
                                    <span
                                        className="font-medium md:block hidden text-text-light dark:text-text-dark">Nouveau résumé</span>
                                </Button>
                                <Button className="flex items-center ">
                                    <span
                                        className="material-icons text-subtext-light dark:text-subtext-dark"> <FileIcon/> </span> <span
                                    className="font-medium md:block hidden text-text-light dark:text-text-dark">Créer un examen</span>
                                </Button>
                                <Button className="flex items-center">
                            <span
                                className="material-icons text-subtext-light dark:text-subtext-dark"><Bot/></span>
                                    <span
                                        className="font-medium md:block hidden text-text-light dark:text-text-dark">Copain d'étude IA</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-span-12 xl:col-span-5">
                    <UpcomingSchedule/>
                </div>

                <div className="col-span-12 xl:col-span-7">
                    <div className="space-y-8">
                        <div className="bg-white border-gray-200 border-1 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">Reprises de
                                flashcards</h2>
                            <div className="grid items-end grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg">
                                    <p className="text-sm text-subtext-light dark:text-subtext-dark mb-2">Physique</p>
                                    <p className="font-medium text-text-light dark:text-text-dark mb-4">Formule d'énergie
                                        cinétique ?</p>
                                    <button
                                        className="w-full bg-white dark:bg-gray-700 border border-border-light dark:border-border-dark rounded-lg py-2 text-sm font-medium text-text-light dark:text-text-dark">Réviser
                                    </button>
                                </div>
                                <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg">
                                    <p className="text-sm text-subtext-light dark:text-subtext-dark mb-2">Biologie</p>
                                    <p className="font-medium text-text-light dark:text-text-dark mb-4">Rôle des
                                        ribosomes</p>
                                    <button
                                        className="w-full bg-white dark:bg-gray-700 border border-border-light dark:border-border-dark rounded-lg py-2 text-sm font-medium text-text-light dark:text-text-dark">Réviser
                                    </button>
                                </div>
                                <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg">
                                    <p className="text-sm text-subtext-light dark:text-subtext-dark mb-2">Anglais</p>
                                    <p className="font-medium text-text-light dark:text-text-dark mb-4">Past perfect vs past
                                        simple</p>
                                    <button
                                        className="w-full bg-white dark:bg-gray-700 border border-border-light dark:border-border-dark rounded-lg py-2 text-sm font-medium text-text-light dark:text-text-dark">Réviser
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*<div className="col-span-12 xl:col-span-7">*/}
                {/*    <RecentOrders />*/}
                {/*</div>*/}
            </div>
        </>
    );
}
