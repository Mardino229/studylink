import { useMemo, useEffect, useRef, useState } from "react";
import { useUser } from "../../components/layout/userContext.tsx";
import Avatar from "../../components/ui/avatar/Avatar.tsx";
import { Button } from "../../components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Settings as SettingsIcon, Pencil, CreditCard, X } from "lucide-react";

export default function Profile() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const avatarUrl = useMemo(() => {
    const first = user?.first_name || "";
    const last = user?.last_name || "";
    const seed = encodeURIComponent(`${first} ${last}`.trim() || "User");
    return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}`;
  }, [user?.first_name, user?.last_name]);

  // Mocks simples pour l'affichage (en attendant les données backend)
  const plan = useMemo(() => ({
    name: "Standard",
    trial: false,
    credits: { used: 42, total: 100 },
  }), []);

  const progression = useMemo(() => ({
    overall: 68, // progression globale en %
  }), []);

  const usage = useMemo(() => ({
    coursesGenerated: 6,
    summariesGenerated: 18,
    examsGenerated: 4,
  }), []);

  // Draggable trigger state/logic
  const [dragY, setDragY] = useState<number>(0);
  const isDraggingRef = useRef(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    // Initialize at mid-screen
    setDragY(window.innerHeight / 2);

    const onMove = (clientY: number) => {
      const min = 72; // keep clear of header
      const max = window.innerHeight - 72; // keep above footer
      const next = Math.min(Math.max(clientY - offsetRef.current, min), max);
      setDragY(next);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      onMove(e.clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      onMove(e.touches[0].clientY);
    };
    const handleEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchend", handleEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
    };
  }, []);

  return (
    <>
    <div className="space-y-8">
      {/* Hero profil */}
      <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900/60 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="ring-4 ring-white dark:ring-gray-900 rounded-full shadow-sm">
              <Avatar
                src={avatarUrl}
                alt={(user?.first_name || "") + " " + (user?.last_name || "")}
                size="xxlarge"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gérez vos informations et suivez votre progression.</p>
            </div>
          </div>
          {/* Actions déplacées dans le mini drawer à droite */}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Infos personnelles */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-4">Infos personnelles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/40">
                <div className="text-xs text-gray-500">Prénom</div>
                <div className="mt-1 font-medium">{user?.first_name || "-"}</div>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/40">
                <div className="text-xs text-gray-500">Nom</div>
                <div className="mt-1 font-medium">{user?.last_name || "-"}</div>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/40 sm:col-span-1">
                <div className="text-xs text-gray-500">E-mail</div>
                <div className="mt-1 font-medium break-all">{user?.email || "-"}</div>
              </div>
            </div>
          </section>

          {/* Résumé d'utilisation */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-4">Résumé d’utilisation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Cours générés", value: usage.coursesGenerated },
                { label: "Résumés générés", value: usage.summariesGenerated },
                { label: "Épreuves générées", value: usage.examsGenerated },
              ].map((card) => (
                <div key={card.label} className="rounded-lg border border-gray-200 dark:border-gray-800 p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/40 shadow-xs">
                  <div className="text-xs text-gray-500">{card.label}</div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Plan et crédits */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold">Mon plan</h2>
            <Button className="mt-2" size="sm" variant="outline" onClick={() => navigate("/settings/subscription")}>Changer de plan</Button>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Plan actuel</div>
                <div className="font-medium">{plan.name}{plan.trial ? " (Essai)" : ""}</div>
              </div>
              <div className="text-xs text-gray-500">{plan.credits.used}/{plan.credits.total} crédits</div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: `${(plan.credits.used / plan.credits.total) * 100}%` }}
              />
            </div>
          </section>

          {/* Progression globale */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Progression globale</h2>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Avancement</span>
              <span>{progression.overall}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                style={{ width: `${progression.overall}%` }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>

    {/* Mini Drawer d'actions à droite */}
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          aria-label="Ouvrir le panneau d’actions"
          className="fixed right-5 z-40 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 p-3 cursor-grab active:cursor-grabbing"
          style={{ top: dragY }}
          onMouseDown={(e) => {
            isDraggingRef.current = true;
            offsetRef.current = e.clientY - dragY;
          }}
          onTouchStart={(e) => {
            isDraggingRef.current = true;
            offsetRef.current = e.touches[0].clientY - dragY;
          }}
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-80 max-w-[85vw] z-50 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right focus:outline-none">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="font-semibold">Actions</div>
            <Dialog.Close className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-4 h-4" />
              <span className="sr-only">Fermer</span>
            </Dialog.Close>
          </div>
          <div className="p-4 space-y-3 mt-6">
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/settings/profile")}> 
              <Pencil className="w-4 h-4 mr-2" /> Modifier le profil
            </Button>
            <Button className="w-full justify-start" onClick={() => navigate("/settings/subscription")}>
              <CreditCard className="w-4 h-4 mr-2" /> Gérer l’abonnement
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    </>
  );
}
