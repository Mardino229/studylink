import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { SummaryCard } from "../../components/ui/summary-card.tsx";
import { PlusIcon } from "../../icons";
import Button from "../../components/ui/button/Button.tsx";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../../components/ui/modal";
import { useGetCourses } from "../../utils/course.ts";
import { useGetSummaries, useCreateSummary, useUpdateSummary, useDeleteSummary } from "../../utils/summary.ts";
import { Input } from "../../components/ui/input.tsx";
import { Label } from "../../components/ui/label.tsx";
import { RotatingLines } from "react-loader-spinner";
import { ArrowLeft, FileText } from "lucide-react";
import { StepTracker } from "../../components/summary/stepper.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../../components/ui/form.tsx";
import { z } from "zod";

// Schéma de validation avec Zod pour le formulaire de création de résumé
const summarySchema = z.object({
    summary_name: z.string().min(1, "Le nom du résumé est requis").min(3, "Le nom doit contenir au moins 3 caractères"),
    file: z.instanceof(File, { message: "Veuillez sélectionner un fichier" })
        .refine((file) => file.size <= 10 * 1024 * 1024, "Le fichier ne doit pas dépasser 10 Mo")
        .refine(
            (file) => ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.ms-powerpoint"].includes(file.type),
            "Format de fichier non supporté. Utilisez PDF, DOC, DOCX, PPT ou PPTX"
        ),
});

type SummaryFormData = z.infer<typeof summarySchema>;

export default function SummaryList() {
    const [open, setOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [summaryToDelete, setSummaryToDelete] = useState<string | null>(null);
    const navigate = useNavigate();
    const { courseId, courseName } = useParams();
    const { data: courses } = useGetCourses();

    const { data: summaries, isLoading } = useGetSummaries(courseId);
    const createSummary = useCreateSummary();
    const updateSummary = useUpdateSummary();
    const deleteSummary = useDeleteSummary();

    const currentCourseName = courseName ? decodeURIComponent(courseName) : courses?.find(c => c.id === courseId)?.course_name;

    // Configuration de React Hook Form avec Zod
    const form = useForm<SummaryFormData>({
        resolver: zodResolver(summarySchema),
        defaultValues: {
            summary_name: "",
            file: undefined,
        },
    });

    // Gestion de la soumission du formulaire
    const onSubmit = (data: SummaryFormData) => {
        if (!courseId) return;

        createSummary.mutate({ title: data.summary_name, courseId, file: data.file }, {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            }
        });
    }

    const handleRename = (id: string, newTitle: string) => {
        updateSummary.mutate({ id: id.toString(), summary_name: newTitle });
    };

    const handleDelete = (id: string) => {
        setSummaryToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (summaryToDelete) {
            deleteSummary.mutate(summaryToDelete.toString(), {
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setSummaryToDelete(null);
                }
            });
        }
    };

    return (
        <>
            <PageMeta
                title="Summary"
                description="This is your summary list"
            />
            <PageBreadcrumb 
                pageTitle={currentCourseName || "My Summary"} 
                items={[
                    { label: "My Courses", path: "/my-courses" }
                ]}
            />

            <div className="space-y-6 pt-8">
                <div className="flex gap-3 sm:gap-4 items-center flex-wrap justify-between">
                    <button
                        onClick={() => navigate("/my-courses")}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden xs:inline sm:inline">Retour aux cours</span>
                        <span className="inline xs:hidden sm:hidden">Retour</span>
                    </button>
                    <div className="gap-3 sm:gap-4 flex-wrap-reverse flex justify-end w-full sm:w-auto">
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
                                type="text"
                                placeholder="Rechercher par nom..."
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                            />
                        </div>

                        <Button
                            size="sm"
                            variant="primary"
                            startIcon={<PlusIcon className="size-5" />}
                            onClick={() => setOpen(true)}
                        >
                             <span></span> <span className="md:flex hidden">New summary</span>
                        </Button>

                        <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-md p-6">
                            <div className="text-lg font-semibold text-foreground mb-4">
                                Créer un résumé
                            </div>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <Label className="mb-1.5">Cours</Label>
                                        <Input
                                            className="form-input block w-full appearance-none cursor-not-allowed rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm"
                                            value={currentCourseName || "Chargement..."}
                                            disabled
                                        />
                                    </div>
                                    
                                    <FormField
                                        control={form.control}
                                        name="summary_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nom du résumé</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="form-input block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm"
                                                        placeholder="Ex: Chapitre 3 - Thermodynamique"
                                                        disabled={createSummary.isPending}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="file"
                                        render={({ field: { value, onChange, ...fieldProps } }) => (
                                            <FormItem>
                                                <FormLabel>Fichier</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) onChange(file);
                                                        }}
                                                        className="file:mr-3 file:rounded file:border-0 file:px-2 file:bg-gray-100 p-3 dark:bg-gray-900"
                                                        disabled={createSummary.isPending}
                                                        {...fieldProps}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    {/* Stepper de progression - affiché uniquement pendant la création */}
                                    { courseId && (
                                        <div className="pt-2">
                                            <StepTracker courseId={courseId} />
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setOpen(false)} 
                                            className="px-4 py-2 rounded-md border border-border bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={createSummary.isPending}
                                        >
                                            {createSummary.isPending ? "Traitement..." : "Annuler"}
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={createSummary.isPending} 
                                            className="px-4 py-2 rounded-md bg-primary text-background disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                                        >
                                            {createSummary.isPending ? (
                                                <RotatingLines
                                                    visible={true}
                                                    strokeWidth="5"
                                                    width="20"
                                                    strokeColor="#ffffff"
                                                    animationDuration="0.75"
                                                    ariaLabel="rotating-lines-loading"
                                                />
                                            ) : "Créer"}
                                        </button>
                                    </div>
                                </form>
                            </Form>
                        </Modal>

                        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-md p-6">
                            <div className="text-lg font-semibold text-foreground mb-4">
                                Confirmer la suppression
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Êtes-vous sûr de vouloir supprimer ce résumé ? Cette action est irréversible.
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="px-4 py-2 rounded-md border border-border bg-background text-foreground hover:bg-gray-50 dark:hover:bg-white/5"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    disabled={deleteSummary.isPending}
                                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                                >
                                    {deleteSummary.isPending ? (
                                        <RotatingLines
                                            visible={true}
                                            strokeWidth="5"
                                            width="20"
                                            strokeColor="#ffffff"
                                                ariaLabel="rotating-lines-loading"
                                        />
                                    ) : "Supprimer"}
                                </button>
                            </div>
                        </Modal>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {isLoading ? (
                        <p className="text-sm text-foreground/60 col-span-full">Chargement des résumés...</p>
                    ) : summaries?.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-24">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6">
                                    <FileText size={48} className="text-gray-400 dark:text-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        Aucun résumé pour ce cours
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Créez-en un pour commencer à organiser vos notes !
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        summaries?.map((summary) => (
                            <SummaryCard
                                key={summary.id}
                                title={summary.summary_name}
                                date={summary.generation_date ? new Date(summary.generation_date).toLocaleDateString() : "Récemment"}
                                
                                isUpdating={updateSummary.isPending && updateSummary.variables?.id === summary.id.toString()}
                                onClick={() => navigate(`/my-courses/${courseId}/${encodeURIComponent(currentCourseName || courseName || '')}/summaries/${summary.id}`)}
                                onRename={(newTitle) => handleRename(summary.id, newTitle)}
                                onDelete={() => handleDelete(summary.id)}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}