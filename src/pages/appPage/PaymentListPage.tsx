import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import { useRef, useState } from "react";
import Select from "../../components/form/Select.tsx";
import HistoryPaymentTableOne from "../../components/table/BasicTables/HistoryPaymentTableOne.tsx";

export default function PaymentListPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [byPage, setByPage] = useState(10);
    const listPage = [2, 5, 10, 20, 50];
    const pageOptions = listPage.map((page) => ({
        value: page,
        label: page.toString(),
    }));

    const handlePageChange = (value: string) => {
        setByPage(parseInt(value));
    };

    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div>
            <PageMeta title="Historique des paiements" description="Consultez votre historique de paiements" />
            <PageBreadcrumb pageTitle="Historique des paiements" />
            
            <div className="space-y-6">
                <ComponentCard title="Liste des paiements">
                    <div className="flex gap-4 flex-wrap justify-between">
                        <div>
                            <Select
                                options={pageOptions}
                                defaultValue={byPage.toString()}
                                placeholder="Entrée par page"
                                onChange={handlePageChange}
                                className={`dark:bg-dark-900`}
                            />
                        </div>
                        <div className="gap-4 flex-wrap-reverse flex w-full justify-end">
                            <div className="relative">
                                <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                                  <svg
                                      className="fill-gray-500 dark:fill-gray-400"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                                        fill=""
                                    />
                                  </svg>
                                </span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Rechercher par ID, plan, méthode..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                                />
                            </div>
                        </div>
                    </div>
                    <HistoryPaymentTableOne searchTerm={searchTerm} itemsPerPage={byPage} />
                </ComponentCard>
            </div>
        </div>
    );
}
