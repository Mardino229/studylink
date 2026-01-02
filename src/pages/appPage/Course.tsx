import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import { PlusIcon } from "../../icons";
import { Modal } from "../../components/ui/modal/index.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select.tsx";
import { useState } from "react";
import { Input } from "../../components/ui/input.tsx";
import { ModernBookCover, BookHeader, BookTitle } from "../../components/ui/modern-book-cover.tsx";
import { BookIcon, Pencil, Trash2, MoreVertical, BookOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../../components/ui/form.tsx";
import { useGetCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, courseSchema, type CourseFormRequest, type Course } from "../../utils/course.ts";
import { RotatingLines } from "react-loader-spinner";
import { Dropdown } from "../../components/ui/dropdown/Dropdown.tsx";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem.tsx";
import { useNavigate } from "react-router-dom";

export default function MyCourse() {
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const navigate = useNavigate();

    const { data: courses, isLoading } = useGetCourses();
    const createCourse = useCreateCourse();
    const updateCourse = useUpdateCourse();
    const deleteCourse = useDeleteCourse();

    const form = useForm<CourseFormRequest>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            course_name: "",
            course_color: "emerald",
        },
    });

    const onSubmit = (data: CourseFormRequest) => {
        if (editingId) {
            updateCourse.mutate({ id: editingId, data }, {
                onSuccess: () => {
                    setOpen(false);
                    setEditingId(null);
                    form.reset();
                }
            });
        } else {
            createCourse.mutate(data, {
                onSuccess: () => {
                    setOpen(false);
                    form.reset();
                }
            });
        }
    };

    const startCreate = () => {
        setEditingId(null);
        form.reset({ course_name: "", course_color: "emerald" });
        setOpen(true);
    };

    const startEdit = (course: Course) => {
        setEditingId(course.id);
        form.reset({ course_name: course.course_name, course_color: course.course_color as any });
        setOpen(true);
        setActiveDropdownId(null);
    };

    const removeCourse = (id: string) => {
        setCourseToDelete(id);
        setDeleteModalOpen(true);
        setActiveDropdownId(null);
    };

    const confirmDelete = () => {
        if (courseToDelete) {
            deleteCourse.mutate(courseToDelete, {
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setCourseToDelete(null);
                }
            });
        }
    };

    const toggleDropdown = (id: string) => {
        setActiveDropdownId(activeDropdownId === id ? null : id);
    };

    return (
        <>
            <PageMeta
                title="My Courses"
                description="This is your course list"
            />
            <PageBreadcrumb pageTitle="My Courses" />
            <div className="space-y-6">
                <div className="flex gap-4 flex-wrap justify-between">
                    <div>
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
                                type="text"
                                placeholder="Search by name"
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                            />
                        </div>
                        <Button
                            size="sm"
                            variant="primary"
                            startIcon={<PlusIcon className="size-5" />}
                            onClick={startCreate}
                        >
                            <span></span> <span className="md:flex hidden">New course</span>

                        </Button>

                        <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-md p-6">
                            <div className="text-lg font-semibold text-foreground mb-4">
                                {editingId ? "Modifier le cours" : "Nouveau cours"}
                            </div>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="course_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Titre du cours</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="form-input block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm"
                                                        placeholder="Ex: Mathématiques"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="course_color"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Couleur</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full px-3 py-3">
                                                            <SelectValue placeholder="Sélectionner une couleur" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {[
                                                            "emerald", "teal", "orange", "blue", "green", "rose", "red", "amber", "indigo", "violet", "purple", "pink", "cyan", "sky", "lime", "zinc", "slate", "gray", "neutral", "stone", "yellow"
                                                        ].map((c) => (
                                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-md border border-border bg-background text-foreground">Annuler</button>
                                        <button type="submit" className={`${createCourse.isPending || updateCourse.isPending && "bg-background"} px-4 py-2 rounded-md bg-primary text-background`} disabled={createCourse.isPending || updateCourse.isPending}>
                                            {createCourse.isPending || updateCourse.isPending ?
                                                <RotatingLines
                                                    visible={true}
                                                    strokeWidth="5"
                                                    width="20"
                                                    strokeColor="#135bec"
                                                    animationDuration="0.75"
                                                    ariaLabel="rotating-lines-loading"
                                                /> : (editingId ? "Enregistrer" : "Créer")}
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
                                Êtes-vous sûr de vouloir supprimer ce cours{courseToDelete && courses ? ` "${courses.find(c => c.id === courseToDelete)?.course_name}"` : ""} ? Cette action est irréversible et supprimera également tous les résumés associés.
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
                                    disabled={deleteCourse.isPending}
                                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                                >
                                    {deleteCourse.isPending ? (
                                        <RotatingLines
                                            visible={true}
                                            strokeWidth="5"
                                            width="20"
                                            strokeColor="#ffffff"
                                            animationDuration="0.75"
                                            ariaLabel="rotating-lines-loading"
                                        />
                                    ) : "Supprimer"}
                                </button>
                            </div>
                        </Modal>
                    </div>
                </div>

                {/* Compteur */}
                <div className="text-sm text-foreground/70">Total cours: <span className="font-medium text-foreground">{courses?.length || 0}</span></div>

                {/* Liste dynamique des cours */}
                <div className="flex flex-wrap sm:gap-8 gap-5 justify-start w-full">
                    {isLoading ? (
                        <p className="text-sm text-foreground/60">Chargement...</p>
                    ) : courses?.length === 0 ? (
                        <div className="w-full flex flex-col items-center justify-center py-16 sm:py-24">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6">
                                    <BookOpen size={48} className="text-gray-400 dark:text-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        Aucun cours pour le moment
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Créez votre premier cours pour commencer !
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        courses?.map((c) => (
                            <div key={c.id} className="relative flex flex-col items-center group">
                                <div onClick={() => navigate(`/my-courses/${c.id}/${encodeURIComponent(c.course_name)}/summaries`)}>
                                    <ModernBookCover size="sm" color={c.course_color}>
                                        <BookHeader>
                                            <BookIcon size={20} />
                                        </BookHeader>
                                        <BookTitle>{c.course_name}</BookTitle>
                                    </ModernBookCover>
                                </div>

                                <div className="absolute top-2 right-2 z-20">
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleDropdown(c.id);
                                            }}
                                            className="p-1 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-gray-700 dark:text-gray-200 shadow-sm dropdown-toggle"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        <Dropdown
                                            isOpen={activeDropdownId === c.id}
                                            onClose={() => setActiveDropdownId(null)}
                                            className="w-40 right-0 top-full mt-1"
                                        >
                                            <DropdownItem onClick={() => startEdit(c)} className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                <Pencil size={14} />
                                                <span>Modifier</span>
                                            </DropdownItem>
                                            <DropdownItem onClick={() => removeCourse(c.id)} className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                <Trash2 size={14} />
                                                <span>Supprimer</span>
                                            </DropdownItem>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
