import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import { Modal } from "../../components/ui/modal";
import { Input } from "../../components/ui/input.tsx";
import { Label } from "../../components/ui/label.tsx";
import { RotatingLines } from "react-loader-spinner";
import { PlusIcon } from "../../icons";
import { FileText } from "lucide-react";
import { useGetExams, useCreateExam, examSchema, type ExamFormValues } from "../../utils/exam.ts";
import { ExamCard } from "../../components/ui/exam-card.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select.tsx";

export default function ExamLibrary() {
    const { data: exams = [], isLoading } = useGetExams();
    const createExam = useCreateExam();

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("all");
    const [selectedProgram, setSelectedProgram] = useState("all");
    const [selectedYear, setSelectedYear] = useState("all");

    // Form
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ExamFormValues>({
        resolver: zodResolver(examSchema),
    });

    // Derived state for filters
    const faculties = Array.from(new Set(exams.map(e => e.faculty).filter(Boolean))) as string[];
    const programs = Array.from(new Set(exams.map(e => e.program).filter(Boolean))) as string[];
    const years = Array.from(new Set(exams.map(e => e.year).filter(Boolean))) as string[];

    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFaculty = selectedFaculty === "all" || !selectedFaculty || exam.faculty === selectedFaculty;
        const matchesProgram = selectedProgram === "all" || !selectedProgram || exam.program === selectedProgram;
        const matchesYear = selectedYear === "all" || !selectedYear || exam.year === selectedYear;
        return matchesSearch && matchesFaculty && matchesProgram && matchesYear;
    });

    const onSubmit = (data: ExamFormValues) => {
        const fileToUpload = data.file instanceof FileList ? data.file[0] : data.file;

        createExam.mutate({
            title: data.title,
            faculty: data.faculty,
            program: data.program,
            year: data.year,
            file: fileToUpload as File
        }, {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            }
        });
    };

    return (
        <>
            <PageMeta
                title="Exam Library"
                description="Browse and upload exams."
            />
            <PageBreadcrumb
                pageTitle="Exam Library"
                items={[
                    { label: "Test and Exams", path: "/exams" }
                ]}
            />

            <div className="space-y-6 pt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Bibliothèque d'examens
                    </h2>
                    <Button
                        size="sm"
                        variant="primary"
                        startIcon={<PlusIcon className="size-5" />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span>Uploader un examen</span>
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                        <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Toutes les facultés" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les facultés</SelectItem>
                                {faculties.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Tous les programmes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les programmes</SelectItem>
                                {programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Toutes les années" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les années</SelectItem>
                                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {isLoading ? (
                        <p className="text-sm text-foreground/60 col-span-full">Chargement des examens...</p>
                    ) : filteredExams.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-24">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6">
                                    <FileText size={48} className="text-gray-400 dark:text-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        Aucun examen trouvé
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Essayez de modifier vos filtres ou votre recherche.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        filteredExams.map((exam) => (
                            <ExamCard key={exam.id} exam={exam} />
                        ))
                    )}
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md p-6">
                    <div className="text-lg font-semibold text-foreground mb-4">
                        Uploader un examen
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label className="mb-1.5">Nom de l'examen <span className="text-red-500">*</span></Label>
                            <Input
                                className="form-input block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm"
                                placeholder="Ex: Physique - 2024 - Final"
                                {...register("title")}
                            />
                            {errors.title && (
                                <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Nomenclature: Matière - Année - Type
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-1.5">Année</Label>
                                <Input
                                    className="form-input block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm"
                                    placeholder="Ex: 2024"
                                    {...register("year")}
                                />
                                {errors.year && (
                                    <p className="mt-1 text-xs text-red-500">{errors.year.message}</p>
                                )}
                            </div>
                            <div>
                                <Label className="mb-1.5">Faculté</Label>
                                <Input
                                    className="form-input block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm"
                                    placeholder="Ex: Sciences"
                                    {...register("faculty")}
                                />
                                {errors.faculty && (
                                    <p className="mt-1 text-xs text-red-500">{errors.faculty.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label className="mb-1.5">Programme</Label>
                            <Input
                                className="form-input block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm"
                                placeholder="Ex: Licence Physique"
                                {...register("program")}
                            />
                            {errors.program && (
                                <p className="mt-1 text-xs text-red-500">{errors.program.message}</p>
                            )}
                        </div>

                        <div>
                            <Label className="mb-1.5">Fichier <span className="text-red-500">*</span></Label>
                            <Input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.png"
                                className="file:mr-3 file:rounded file:border-0 file:px-2 file:bg-gray-100 p-3 dark:bg-gray-900"
                                {...register("file")}
                            />
                            {errors.file && (
                                <p className="mt-1 text-xs text-red-500">{errors.file.message?.toString()}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-md border border-border bg-background text-foreground hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={createExam.isPending}
                                className="px-4 py-2 rounded-md bg-primary text-background disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                            >
                                {createExam.isPending ? (
                                    <RotatingLines
                                        visible={true}
                                        strokeWidth="5"
                                        width="20"
                                        strokeColor="#ffffff"
                                        animationDuration="0.75"
                                        ariaLabel="rotating-lines-loading"
                                    />
                                ) : "Uploader"}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </>
    );
}
