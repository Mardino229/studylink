import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import { PlusIcon } from "../../icons";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input.tsx";
import { ModernBookCover, BookHeader, BookTitle } from "../../components/ui/modern-book-cover.tsx";
import { BookIcon, Pencil, Trash2 } from "lucide-react";

export default function MyCourse() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [color, setColor] = useState<
        "slate"|"gray"|"zinc"|"neutral"|"stone"|"red"|"orange"|"amber"|"yellow"|"lime"|"green"|"emerald"|"teal"|"cyan"|"sky"|"blue"|"indigo"|"violet"|"purple"|"fuchsia"|"pink"|"rose"
    >("emerald");
    type Course = { id: string; title: string; color: typeof color };
    const [courses, setCourses] = useState<Course[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [toasts, setToasts] = useState<{ id: string; message: string; type: "success"|"info"|"error" }[]>([]);

    const pushToast = (message: string, type: "success"|"info"|"error" = "success") => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
        setToasts((t) => [...t, { id, message, type }]);
        setTimeout(() => {
            setToasts((t) => t.filter(x => x.id !== id));
        }, 2500);
    };

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem("studylink_courses");
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    setCourses(parsed);
                }
            }
        } catch {}
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem("studylink_courses", JSON.stringify(courses));
        } catch {}
    }, [courses]);

    const onCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        if (editingId) {
            setCourses((prev) => prev.map(c => c.id === editingId ? { ...c, title: title.trim(), color } : c));
            pushToast("Cours mis à jour", "success");
        } else {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
            setCourses((prev) => [{ id, title: title.trim(), color }, ...prev]);
            pushToast("Cours créé", "success");
        }
        setTitle("");
        setColor("emerald");
        setEditingId(null);
        setOpen(false);
    };

    const startCreate = () => {
        setTitle("");
        setColor("emerald");
        setEditingId(null);
        setOpen(true);
    };

    const startEdit = (course: Course) => {
        setTitle(course.title);
        setColor(course.color);
        setEditingId(course.id);
        setOpen(true);
    };

    const removeCourse = (id: string) => {
        const target = courses.find(c => c.id === id);
        const ok = window.confirm(`Supprimer le cours${target ? ` "${target.title}"` : ""} ?`);
        if (!ok) return;
        setCourses(prev => prev.filter(c => c.id !== id));
        pushToast("Cours supprimé", "success");
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
                    {/*<Select*/}
                    {/*    options={[1]}*/}
                    {/*    defaultValue={byPage.toString()}*/}
                    {/*    placeholder="Entrée par page"*/}
                    {/*    onChange={handlePageChange}*/}
                    {/*    className={`dark:bg-dark-900`}*/}
                    {/*/>*/}
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
                            // ref={}
                            type="text"
                            placeholder="Rechercher par nom, adresse..."
                            // value={searchTerm}
                            // onChange={(e) => setSearchTerm(e.target.value)}
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                        />
                    </div>
                    <Dialog.Root open={open} onOpenChange={setOpen}>
                        <Dialog.Trigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                startIcon={<PlusIcon className="size-5" />}
                                onClick={startCreate}
                            >
                                Créer un cours
                            </Button>
                        </Dialog.Trigger>
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
                            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl focus:outline-none">
                                <Dialog.Title className="text-lg font-semibold text-foreground">{editingId ? "Modifier le cours" : "Nouveau cours"}</Dialog.Title>
                                <form onSubmit={onCreate} className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm text-foreground/70 mb-1">Titre du cours</label>
                                        <Input value={title} onChange={(e)=> setTitle(e.target.value)} placeholder="Ex: Mathématiques" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-foreground/70 mb-1">Couleur</label>
                                        <select value={color} onChange={(e)=> setColor(e.target.value as any)} className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2">
                                            {[
                                                "emerald","teal","orange","blue","green","rose","red","amber","indigo","violet","purple","pink","cyan","sky","lime","zinc","slate","gray","neutral","stone","yellow"
                                            ].map((c)=> (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button type="button" onClick={()=> setOpen(false)} className="px-4 py-2 rounded-md border border-border bg-background text-foreground">Annuler</button>
                                        <button type="submit" className="px-4 py-2 rounded-md bg-foreground text-background">{editingId ? "Enregistrer" : "Créer"}</button>
                                    </div>
                                </form>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                </div>
            </div>

                {/* Compteur */}
                <div className="text-sm text-foreground/70">Total cours: <span className="font-medium text-foreground">{courses.length}</span></div>

                {/* Liste dynamique des cours */}
                <div className="flex flex-wrap sm:gap-8 gap-5 sm:justify-start justify-center ">
                    {courses.length === 0 ? (
                        <p className="text-sm text-foreground/60">Aucun cours pour le moment. Créez votre premier cours.</p>
                    ) : (
                        courses.map((c) => (
                            <div key={c.id} className="flex flex-col items-center">
                                <ModernBookCover size="sm" color={c.color as any}>
                                    <BookHeader>
                                        <BookIcon size={20} />
                                    </BookHeader>
                                    <BookTitle>{c.title}</BookTitle>
                                </ModernBookCover>
                                <div className="mt-2 flex gap-2">
                                    <button onClick={()=> startEdit(c)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border text-foreground hover:bg-card">
                                        <Pencil className="w-3.5 h-3.5" /> Modifier
                                    </button>
                                    <button onClick={()=> removeCourse(c.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Toasts */}
                <div className="fixed bottom-4 right-4 z-50 space-y-2">
                    {toasts.map(t => (
                        <div key={t.id} className={`min-w-[240px] rounded-md px-4 py-2 text-sm shadow-lg border 
                            ${t.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : ''}
                            ${t.type === 'info' ? 'bg-blue-600 text-white border-blue-500' : ''}
                            ${t.type === 'error' ? 'bg-red-600 text-white border-red-500' : ''}
                        `}>
                            {t.message}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
