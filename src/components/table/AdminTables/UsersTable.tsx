import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useState, useMemo } from "react";
import Button from "../../ui/button/Button.tsx";
import { type AdminUser } from "../../../utils/type";
import { Eye } from "lucide-react";
import { Modal } from "../../ui/modal/index.tsx";

interface UsersTableProps {
    searchTerm?: string;
    statusFilter?: string;
    itemsPerPage?: number;
    users: AdminUser[];
    onSetStatus: (id: string, next: boolean) => void;
}

export default function UsersTable({
    searchTerm = "",
    statusFilter = "all",
    itemsPerPage = 10,
    users,
}: UsersTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const initials = (first: string | null, last: string | null) => {
        const f = first?.[0] || "";
        const l = last?.[0] || "";
        return (f + l).toUpperCase() || "?";
    };

    const fullName = (first: string | null, last: string | null) => {
        if (!first && !last) return "Utilisateur inconnu";
        return `${first || ""} ${last || ""}`.trim();
    };

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const name = fullName(u.first_name, u.last_name);
            const matchQ = searchTerm.trim().length === 0 || `${name} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === "all" ||
                (statusFilter === "active" && u.is_active) ||
                (statusFilter === "inactive" && !u.is_active);
            return matchQ && matchStatus;
        });
    }, [users, searchTerm, statusFilter]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const formatValue = (val: string | number | null | undefined) => {
        return val || "Non attribué";
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <div className={users.length !== 0 ? "" : "h-64 flex items-center justify-center"}>
                    {users.length === 0 ? (
                        <p className="text-center py-8 font-medium text-gray-800 dark:text-white/90">
                            Aucun utilisateur enregistré
                        </p>
                    ) : (
                        <>
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Utilisateur
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Email
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Rôle
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Faculté
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Statut
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {paginatedUsers.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell className="px-5 py-4 sm:px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 flex items-center justify-center text-xs font-semibold">
                                                        {initials(u.first_name, u.last_name)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                        {fullName(u.first_name, u.last_name)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                                                {u.email}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                                                <span className="capitalize">{u.role?.name || "user"}</span>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                                                {formatValue(u.faculty?.name)}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge
                                                    size="sm"
                                                    color={u.is_active ? "success" : "error"}
                                                >
                                                    {u.is_active ? "Actif" : "Inactif"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-end">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedUser(u)}
                                                        className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Détails"
                                                    >
                                                        <Eye className="size-5" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                                Aucun utilisateur trouvé
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Page {currentPage} sur {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Précédent
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Suivant
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            <Modal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                className="max-w-[500px] p-6"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-5 dark:border-white/[0.05]">
                        <div className="h-16 w-16 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 flex items-center justify-center text-xl font-bold">
                            {initials(selectedUser?.first_name || null, selectedUser?.last_name || null)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                                {fullName(selectedUser?.first_name || null, selectedUser?.last_name || null)}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedUser?.email}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-4">
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Rôle</p>
                            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90 capitalize">
                                {selectedUser?.role?.name || "user"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Faculté</p>
                            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                                {formatValue(selectedUser?.faculty?.name)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Niveau d'études</p>
                            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                                {formatValue(selectedUser?.study_level?.name)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Programme</p>
                            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                                {formatValue(selectedUser?.program?.name || selectedUser?.other_program)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</p>
                            <div className="mt-1">
                                <Badge
                                    size="sm"
                                    color={selectedUser?.is_active ? "success" : "error"}
                                >
                                    {selectedUser?.is_active ? "Actif" : "Inactif"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            variant="primary"
                            onClick={() => setSelectedUser(null)}
                            className="w-full sm:w-auto"
                        >
                            Fermer
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
