import React, { useState } from 'react';
import { Loader2, Pencil, Plus, ToggleLeft, ToggleRight, Zap } from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb.tsx';
import { useGetTokenPacks } from '../../utils/billing';
import { useCreateAdminTokenPack, useUpdateAdminTokenPack, useCreditUserTokens } from '../../utils/admin';
import type { TokenPack } from '../../utils/billing';

export default function TokenPacks() {
    const { data: packs = [], isLoading } = useGetTokenPacks();
    const createPack = useCreateAdminTokenPack();
    const updatePack = useUpdateAdminTokenPack();
    const creditTokens = useCreditUserTokens();

    // ─── Create / Edit pack form ─────────────────────────────
    const [editingPack, setEditingPack] = useState<TokenPack | null>(null);
    const [packForm, setPackForm] = useState({ name: '', tokens: '', price_cad: '' });

    const openCreate = () => {
        setEditingPack(null);
        setPackForm({ name: '', tokens: '', price_cad: '' });
    };

    const openEdit = (pack: TokenPack) => {
        setEditingPack(pack);
        setPackForm({ name: pack.name, tokens: String(pack.tokens), price_cad: pack.price_cad });
    };

    const handleSavePack = () => {
        const tokens = Number(packForm.tokens);
        const price_cad = Number(packForm.price_cad);
        if (!packForm.name.trim() || !tokens || !price_cad) return;

        if (editingPack) {
            updatePack.mutate(
                { id: editingPack.id, data: { name: packForm.name.trim(), tokens, price_cad } },
                { onSuccess: () => setEditingPack(null) }
            );
        } else {
            createPack.mutate(
                { name: packForm.name.trim(), tokens, price_cad },
                { onSuccess: () => setPackForm({ name: '', tokens: '', price_cad: '' }) }
            );
        }
    };

    const toggleActive = (pack: TokenPack) => {
        updatePack.mutate({ id: pack.id, data: { is_active: !pack.is_active } });
    };

    // ─── Manual credit form ──────────────────────────────────
    const [creditForm, setCreditForm] = useState({ user_id: '', amount: '', description: '' });

    const handleCredit = () => {
        if (!creditForm.user_id.trim() || !Number(creditForm.amount) || !creditForm.description.trim()) return;
        creditTokens.mutate(
            { user_id: creditForm.user_id.trim(), amount: Number(creditForm.amount), description: creditForm.description.trim() },
            { onSuccess: () => setCreditForm({ user_id: '', amount: '', description: '' }) }
        );
    };

    const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white";
    const labelCls = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200";

    return (
        <div className="space-y-6">
            <PageMeta title="Admin — Jetons" description="Gestion des packs de jetons" />
            <PageBreadcrumb pageTitle="Packs de jetons" />

            {/* ── Pack list + form ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left: table */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <Zap size={16} className="text-amber-500" />
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Packs actifs</h2>
                        </div>
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            <Plus size={13} />
                            Nouveau pack
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                    ) : packs.length === 0 ? (
                        <div className="py-12 text-center text-sm text-gray-400">Aucun pack pour l'instant.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[480px] text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Nom</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Jetons</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Prix $</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Actif</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {packs.map(pack => (
                                        <tr key={pack.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{pack.name}</td>
                                            <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">🪙 {pack.tokens}</td>
                                            <td className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">{pack.price_cad} $</td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => toggleActive(pack)}
                                                    disabled={updatePack.isPending}
                                                    title={pack.is_active ? 'Désactiver' : 'Activer'}
                                                    className="transition-colors"
                                                >
                                                    {pack.is_active
                                                        ? <ToggleRight size={22} className="text-green-500" />
                                                        : <ToggleLeft size={22} className="text-gray-400" />
                                                    }
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => openEdit(pack)}
                                                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right: create / edit form */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {editingPack ? `Modifier « ${editingPack.name} »` : 'Créer un pack'}
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <label className={labelCls}>Nom</label>
                            <input
                                value={packForm.name}
                                onChange={e => setPackForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="Ex: Standard"
                                className={inputCls}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Jetons</label>
                                <input
                                    type="number"
                                    value={packForm.tokens}
                                    onChange={e => setPackForm(p => ({ ...p, tokens: e.target.value }))}
                                    placeholder="35"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Prix (CAD $)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={packForm.price_cad}
                                    onChange={e => setPackForm(p => ({ ...p, price_cad: e.target.value }))}
                                    placeholder="7.99"
                                    className={inputCls}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                            {editingPack && (
                                <button
                                    onClick={() => { setEditingPack(null); setPackForm({ name: '', tokens: '', price_cad: '' }); }}
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                                >
                                    Annuler
                                </button>
                            )}
                            <button
                                onClick={handleSavePack}
                                disabled={!packForm.name.trim() || !packForm.tokens || !packForm.price_cad || createPack.isPending || updatePack.isPending}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                                {(createPack.isPending || updatePack.isPending) && <Loader2 size={14} className="animate-spin" />}
                                {editingPack ? 'Enregistrer' : 'Créer le pack'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Manual credit ── */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-950/10">
                <h2 className="mb-1 text-sm font-semibold text-amber-900 dark:text-amber-300">Créditer manuellement un utilisateur</h2>
                <p className="mb-4 text-xs text-amber-700 dark:text-amber-400">Utilisé pour des compensations suite à un incident. L'opération est irréversible.</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                        <label className={labelCls}>ID utilisateur</label>
                        <input
                            value={creditForm.user_id}
                            onChange={e => setCreditForm(p => ({ ...p, user_id: e.target.value }))}
                            placeholder="UUID de l'utilisateur"
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Nombre de jetons</label>
                        <input
                            type="number"
                            value={creditForm.amount}
                            onChange={e => setCreditForm(p => ({ ...p, amount: e.target.value }))}
                            placeholder="10"
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Raison</label>
                        <input
                            value={creditForm.description}
                            onChange={e => setCreditForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Compensation suite à un incident"
                            className={inputCls}
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleCredit}
                        disabled={!creditForm.user_id.trim() || !Number(creditForm.amount) || !creditForm.description.trim() || creditTokens.isPending}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                    >
                        {creditTokens.isPending && <Loader2 size={14} className="animate-spin" />}
                        🪙 Créditer
                    </button>
                </div>
            </div>
        </div>
    );
}
