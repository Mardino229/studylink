import { useState, useMemo } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import ConfirmModal from "../ui/ConfirmModal";
import {
  useGrantSubscriptionsByRegistrationOrder,
  useRevokeManualSubscriptions,
} from "../../utils/admin";
import type {
  GrantSubscriptionsResponseData,
  RevokeManualSubscriptionsResponseData,
} from "../../utils/type";
import {
  UserPlus,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  ListOrdered,
  Calendar,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

interface ManualSubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManualSubscriptionsModal({
  isOpen,
  onClose,
}: ManualSubscriptionsModalProps) {
  const [activeTab, setActiveTab] = useState<"grant" | "revoke">("grant");

  // --- Grant State ---
  const [positionsInput, setPositionsInput] = useState("");
  const [planName, setPlanName] = useState("Pro");
  const [billingType, setBillingType] = useState<"monthly" | "annual">("monthly");
  const [isConfirmGrantOpen, setIsConfirmGrantOpen] = useState(false);
  const [grantResult, setGrantResult] = useState<GrantSubscriptionsResponseData | null>(null);

  // --- Revoke All State ---
  const [isConfirmRevokeAllOpen, setIsConfirmRevokeAllOpen] = useState(false);
  const [revokeResult, setRevokeResult] =
    useState<RevokeManualSubscriptionsResponseData | null>(null);

  // --- Clipboard feedback ---
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const grantMutation = useGrantSubscriptionsByRegistrationOrder();
  const revokeMutation = useRevokeManualSubscriptions();

  // Parse registration positions from text
  const { positions, invalidValues, duplicateValues } = useMemo(() => {
    if (!positionsInput.trim()) {
      return { positions: [], invalidValues: [], duplicateValues: [] };
    }

    const rawTokens = positionsInput
      .split(/[\s,;\n\t]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const validNums: number[] = [];
    const invalidTokens: string[] = [];
    const seen = new Set<number>();
    const duplicates: number[] = [];

    for (const token of rawTokens) {
      const num = Number(token);
      if (!Number.isInteger(num) || num <= 0) {
        invalidTokens.push(token);
      } else {
        if (seen.has(num)) {
          if (!duplicates.includes(num)) duplicates.push(num);
        } else {
          seen.add(num);
          validNums.push(num);
        }
      }
    }

    return {
      positions: validNums,
      invalidValues: invalidTokens,
      duplicateValues: duplicates,
    };
  }, [positionsInput]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copié dans le presse-papier");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleGrantSubmit = () => {
    if (positions.length === 0) {
      toast.error("Veuillez renseigner au moins une position valide (> 0).");
      return;
    }
    if (invalidValues.length > 0) {
      toast.error(`Valeurs invalides détectées : ${invalidValues.join(", ")}`);
      return;
    }
    setIsConfirmGrantOpen(true);
  };

  const executeGrant = async () => {
    try {
      const res = await grantMutation.mutateAsync({
        registration_positions: positions,
        plan_name: planName,
        billing_type: billingType,
      });
      setGrantResult(res.data);
      setIsConfirmGrantOpen(false);
    } catch {
      // Error handled by mutation onError toast
    }
  };

  const executeRevokeAll = async () => {
    try {
      const res = await revokeMutation.mutateAsync();
      setRevokeResult(res.data);
      // If we had grant results open, clear them as they are now deleted
      if (grantResult) {
        setGrantResult({
          ...grantResult,
          created: [],
        });
      }
      setIsConfirmRevokeAllOpen(false);
    } catch {
      // Error handled by mutation onError toast
    }
  };

  const resetGrantForm = () => {
    setPositionsInput("");
    setGrantResult(null);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                <ListOrdered size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Abonnements par ordre d'inscription
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Attribution manuelle par ordre d'inscription et révocation globale
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-100 dark:border-white/[0.05]">
            <button
              type="button"
              onClick={() => setActiveTab("grant")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "grant"
                  ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <UserPlus size={16} />
              Attribuer par ordre
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("revoke")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "revoke"
                  ? "border-red-500 text-red-600 dark:border-red-400 dark:text-red-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Trash2 size={16} />
              Révoquer tout (abonnements manuels)
            </button>
          </div>

          {/* TAB 1: Grant by Registration Order */}
          {activeTab === "grant" && (
            <div className="flex flex-col gap-5">
              {!grantResult ? (
                <div className="flex flex-col gap-4">
                  {/* Positions Input */}
                  <div>
                    <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-800 dark:text-gray-200">
                      <span>Positions d'inscription ciblées</span>
                      <span className="text-xs text-gray-400">
                        1 = 1er inscrit, 2 = 2e, etc.
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      value={positionsInput}
                      onChange={(e) => setPositionsInput(e.target.value)}
                      placeholder="Ex: 7, 10, 17, 22, 27, 30"
                      className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
                    />
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        {positions.length > 0
                          ? `${positions.length} position(s) détectée(s) : [${positions.join(", ")}]`
                          : "Entrez des entiers positifs séparés par des virgules ou espaces."}
                      </span>
                      {invalidValues.length > 0 && (
                        <span className="text-red-500 font-medium">
                          Invalide : {invalidValues.join(", ")}
                        </span>
                      )}
                      {duplicateValues.length > 0 && (
                        <span className="text-amber-500 font-medium">
                          Doublons ignorés : {duplicateValues.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Plan and Billing Type */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200">
                        Plan
                      </label>
                      <select
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      >
                        <option value="Pro">Pro</option>
                        <option value="Ultra">Ultra</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200">
                        Type de facturation
                      </label>
                      <select
                        value={billingType}
                        onChange={(e) =>
                          setBillingType(e.target.value as "monthly" | "annual")
                        }
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      >
                        <option value="monthly">Mensuel (accès 30 jours)</option>
                        <option value="annual">Annuel (accès 365 jours)</option>
                      </select>
                    </div>
                  </div>

                  {/* Information notice */}
                  <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/70 p-3.5 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                    <HelpCircle size={16} className="shrink-0 mt-0.5" />
                    <div className="space-y-1 leading-relaxed">
                      <p>
                        <strong>Règles d'attribution :</strong> Les utilisateurs sont triés par date
                        d'inscription croissante (puis UUID). Une transaction <em>completed</em> non-Stripe
                        est automatiquement créée au prix normal du plan.
                      </p>
                      <p>
                        La date de début est choisie aléatoirement entre la date d'inscription et la date courante.
                        Les utilisateurs avec un abonnement actif sont ignorés.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("revoke")}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-medium flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      Supprimer tous les abonnements manuels existants
                    </button>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" onClick={onClose}>
                        Fermer
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleGrantSubmit}
                        disabled={positions.length === 0 || grantMutation.isPending}
                      >
                        {grantMutation.isPending ? "Attribution en cours..." : "Attribuer les abonnements"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* RESULTS VIEW */
                <div className="flex flex-col gap-5">
                  {/* Summary Badges & Quick Action */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge size="md" color="success">
                        {grantResult.created.length} créé(s)
                      </Badge>
                      <Badge size="md" color="warning">
                        {grantResult.skipped_active.length} déjà actif(s)
                      </Badge>
                      <Badge size="md" color="light">
                        {grantResult.missing_positions.length} introuvable(s)
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetGrantForm}
                        startIcon={<RotateCcw size={14} />}
                      >
                        Nouvelle attribution
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsConfirmRevokeAllOpen(true)}
                        className="!bg-red-600 hover:!bg-red-700 !text-white"
                        startIcon={<Trash2 size={14} />}
                      >
                        Tout révoquer
                      </Button>
                    </div>
                  </div>

                  {/* 1. Created Subscriptions */}
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      Abonnements attribués ({grantResult.created.length})
                    </h4>

                    {grantResult.created.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-500 dark:border-gray-800">
                        Aucun abonnement actif créé (utilisateurs déjà abonnés ou révoqués).
                      </p>
                    ) : (
                      <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
                            <tr>
                              <th className="p-2.5 font-medium">Pos.</th>
                              <th className="p-2.5 font-medium">ID Utilisateur</th>
                              <th className="p-2.5 font-medium">ID Abonnement</th>
                              <th className="p-2.5 font-medium">Période (Début - Fin)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {grantResult.created.map((item) => (
                              <tr
                                key={item.subscription_id}
                                className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                              >
                                <td className="p-2.5 font-semibold text-gray-900 dark:text-white">
                                  #{item.position}
                                </td>
                                <td className="p-2.5">
                                  <div className="flex items-center gap-1 font-mono text-gray-600 dark:text-gray-300">
                                    <span className="truncate max-w-[130px]">
                                      {item.user_id}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopy(item.user_id, `user-${item.user_id}`)
                                      }
                                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                      {copiedId === `user-${item.user_id}` ? (
                                        <Check size={12} className="text-emerald-500" />
                                      ) : (
                                        <Copy size={12} />
                                      )}
                                    </button>
                                  </div>
                                </td>
                                <td className="p-2.5">
                                  <div className="flex items-center gap-1 font-mono text-gray-600 dark:text-gray-300">
                                    <span className="truncate max-w-[140px]">
                                      {item.subscription_id}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopy(
                                          item.subscription_id,
                                          `sub-${item.subscription_id}`
                                        )
                                      }
                                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                      {copiedId === `sub-${item.subscription_id}` ? (
                                        <Check size={12} className="text-emerald-500" />
                                      ) : (
                                        <Copy size={12} />
                                      )}
                                    </button>
                                  </div>
                                </td>
                                <td className="p-2.5 text-gray-500 dark:text-gray-400">
                                  {item.start_date ? (
                                    <div className="flex items-center gap-1 text-[11px]">
                                      <Calendar size={12} className="text-gray-400 shrink-0" />
                                      <span>
                                        {formatDate(item.start_date)} → {formatDate(item.end_date)}
                                      </span>
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* 2. Skipped Active Users */}
                  {grantResult.skipped_active.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
                        <AlertTriangle size={15} />
                        Ignorés — Déjà sous abonnement actif ({grantResult.skipped_active.length})
                      </h4>
                      <div className="max-h-40 overflow-y-auto rounded-xl border border-amber-200/50 bg-amber-50/30 p-2.5 text-xs dark:border-amber-900/30 dark:bg-amber-950/10">
                        <div className="flex flex-wrap gap-2">
                          {grantResult.skipped_active.map((u) => (
                            <div
                              key={u.user_id}
                              className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-white px-2.5 py-1 text-gray-700 shadow-sm dark:border-amber-900/50 dark:bg-gray-900 dark:text-gray-300"
                            >
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                #{u.position}
                              </span>
                              <span className="font-mono text-[11px] truncate max-w-[130px]">
                                {u.user_id}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Missing Positions */}
                  {grantResult.missing_positions.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        <HelpCircle size={15} />
                        Positions introuvables ({grantResult.missing_positions.length})
                      </h4>
                      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-600 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400">
                        <p className="mb-1 text-[11px]">
                          Ces positions dépassent le nombre total d'utilisateurs inscrits :
                        </p>
                        <div className="flex flex-wrap gap-1.5 font-mono">
                          {grantResult.missing_positions.map((p) => (
                            <span
                              key={p}
                              className="rounded bg-gray-200 px-2 py-0.5 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            >
                              #{p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex justify-end pt-2">
                    <Button variant="primary" size="sm" onClick={onClose}>
                      Fermer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Revoke ALL Manual Subscriptions */}
          {activeTab === "revoke" && (
            <div className="flex flex-col gap-5">
              {!revokeResult ? (
                <div className="flex flex-col gap-4">
                  {/* Warning banner */}
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/60 p-4 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                    <ShieldAlert size={22} className="shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="space-y-1.5 leading-relaxed">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                        Révocation globale des abonnements manuels
                      </p>
                      <p>
                        Cette action supprime <strong>en une seule opération tous les abonnements</strong> qui
                        ne sont pas liés à Stripe (<code>stripe_subscription_id</code> nul), ainsi que
                        leurs transactions associées.
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        <li>Les abonnements Stripe ne sont <strong>jamais impactés</strong> et restent intacts.</li>
                        <li>Les abonnements manuels déjà marqués <em>canceled</em> sont également supprimés.</li>
                        <li>Aucun paramètre ni UUID n'est nécessaire.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-xs text-gray-600 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400">
                    <p className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                      <Layers size={15} />
                      Endpoint ciblé : <code>POST /api/admin/subscriptions/revoke-manual</code>
                    </p>
                    <p className="mt-1 text-[11px]">
                      Une confirmation explicite vous sera demandée avant de lancer la suppression définitive.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" size="sm" onClick={onClose}>
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsConfirmRevokeAllOpen(true)}
                      disabled={revokeMutation.isPending}
                      className="!bg-red-600 hover:!bg-red-700 !text-white"
                      startIcon={<Trash2 size={15} />}
                    >
                      {revokeMutation.isPending
                        ? "Suppression en cours..."
                        : "Supprimer tous les abonnements manuels"}
                    </Button>
                  </div>
                </div>
              ) : (
                /* REVOKE ALL RESULTS */
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 size={18} />
                      <h4 className="text-sm font-semibold">
                        Révocation globale effectuée avec succès
                      </h4>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Badge size="md" color="success">
                        {revokeResult.total} abonnement(s) supprimé(s)
                      </Badge>
                      <Badge size="md" color="info">
                        {revokeResult.deleted_transactions} transaction(s) supprimée(s)
                      </Badge>
                    </div>
                  </div>

                  {revokeResult.revoked.length > 0 ? (
                    <div>
                      <h4 className="mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Identifiants des abonnements supprimés ({revokeResult.revoked.length}) :
                      </h4>
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 p-2 font-mono text-[11px] text-gray-700 dark:border-gray-800 dark:text-gray-300">
                        {revokeResult.revoked.map((id) => (
                          <div
                            key={id}
                            className="flex items-center justify-between py-1 px-1.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded"
                          >
                            <span>{id}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(id, `rev-${id}`)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
                            >
                              {copiedId === `rev-${id}` ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-xs text-gray-500 py-4">
                      Aucun abonnement manuel n'était présent en base (total = 0).
                    </p>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRevokeResult(null)}
                      startIcon={<RotateCcw size={14} />}
                    >
                      Relancer
                    </Button>
                    <Button variant="primary" size="sm" onClick={onClose}>
                      Fermer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Confirmation 1: Grant confirmation */}
      <ConfirmModal
        isOpen={isConfirmGrantOpen}
        title="Confirmer l'attribution d'abonnements"
        message={`Voulez-vous vraiment attribuer un abonnement ${planName} (${
          billingType === "monthly" ? "Mensuel" : "Annuel"
        }) à ${positions.length} utilisateur(s) aux positions [${positions.join(
          ", "
        )}] ?`}
        confirmLabel="Confirmer l'attribution"
        cancelLabel="Annuler"
        confirmVariant="primary"
        isLoading={grantMutation.isPending}
        onConfirm={executeGrant}
        onCancel={() => setIsConfirmGrantOpen(false)}
      />

      {/* Confirmation 2: Revoke ALL manual subscriptions */}
      <ConfirmModal
        isOpen={isConfirmRevokeAllOpen}
        title="Supprimer TOUS les abonnements manuels ?"
        message="Attention : cette opération va supprimer définitivement de la base de données TOUS les abonnements manuels qui ne sont pas liés à Stripe, ainsi que toutes leurs transactions associées. Les abonnements Stripe resteront inchangés. Confirmez-vous cette action ?"
        confirmLabel="Oui, tout supprimer"
        cancelLabel="Annuler"
        confirmVariant="danger"
        isLoading={revokeMutation.isPending}
        onConfirm={executeRevokeAll}
        onCancel={() => setIsConfirmRevokeAllOpen(false)}
      />
    </>
  );
}
