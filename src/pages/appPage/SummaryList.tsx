import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import BasicTable from "../../components/common/BasicTable.tsx";
import {PlusIcon} from "../../icons";
import Button from "../../components/ui/button/Button.tsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "../../components/ui/dialog";

export default function SummaryList() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleCreateSummary(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim() && !file) return;
        setLoading(true);
        // Mock generation
        setTimeout(() => {
            setLoading(false);
            setOpen(false);
            navigate("/my-summaries/summary", {
                state: {
                    summary: {
                        title: title || (file?.name ?? "Résumé"),
                        points: [
                            "Définition des concepts clés",
                            "Explication des relations entre idées",
                            "Exemples et applications pratiques",
                        ],
                        content: "Résumé généré automatiquement (mock). Vous pouvez enrichir ce contenu avec des points clés, flashcards et quiz.",
                    },
                },
            });
            setTitle("");
            setFile(null);
        }, 900);
    }

    return (
        <>
            <PageMeta
                title="Summary"
                description="This is your summary list"
            />
            <PageBreadcrumb pageTitle="My Summary" />

            <div className="space-y-6 pt-8">
                    <div className="flex gap-4 items-center flex-wrap justify-between">
                        <div className="flex items-center gap-3">
                            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                                <svg
                                    className="stroke-current fill-white dark:fill-gray-800"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M2.29004 5.90393H17.7067"
                                        stroke=""
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M17.7075 14.0961H2.29085"
                                        stroke=""
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                                        fill=""
                                        stroke=""
                                        strokeWidth="1.5"
                                    />
                                    <path
                                        d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                                        fill=""
                                        stroke=""
                                        strokeWidth="1.5"
                                    />
                                </svg>
                                Filter
                            </button>
                            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                                See all
                            </button>
                        </div>
                        <div className="gap-4 flex-wrap-reverse flex  justify-end">
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
                                    // ref={}
                                    type="text"
                                    placeholder="Rechercher par nom, adresse..."
                                    // value={searchTerm}
                                    // onChange={(e) => setSearchTerm(e.target.value)}
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                                />
                            </div>
                            <Dialog open={open} onOpenChange={setOpen}>
                              <DialogTrigger asChild>
                                <span>
                                  <Button
                                      size="sm"
                                      variant="outline"
                                      startIcon={<PlusIcon className="size-5" />}
                                  >
                                      Créer un résumé
                                  </Button>
                                </span>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Créer un résumé</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateSummary} className="space-y-4">
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Titre (optionnel)</div>
                                    <input
                                      value={title}
                                      onChange={(e)=>setTitle(e.target.value)}
                                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-800"
                                      placeholder="Ex: Chapitre 3 - Thermodynamique"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Fichier</div>
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                                      onChange={(e)=> setFile(e.target.files?.[0] || null)}
                                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 dark:bg-gray-900 dark:border-gray-800"
                                      required
                                    />
                                  </div>
                                  <DialogFooter>
                                    <button type="button" onClick={()=>setOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-800">Annuler</button>
                                    <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-foreground text-background disabled:opacity-50">{loading?"Génération…":"Générer"}</button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <BasicTable />
            </div>
        </>
    );
}
