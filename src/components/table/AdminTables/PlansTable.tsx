import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import { type SubscriptionPlan } from "../../../utils/type";
import { Trash2, Pencil } from "lucide-react";

interface PlansTableProps {
    plans: SubscriptionPlan[];
    onRemove: (id: number) => void;
    onEdit: (plan: SubscriptionPlan) => void;
}

export default function PlansTable({
    plans,
    onRemove,
    onEdit,
}: PlansTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <div className={plans.length !== 0 ? "" : "h-64 flex items-center justify-center"}>
                    {plans.length === 0 ? (
                        <p className="text-center py-8 font-medium text-gray-800 dark:text-white/90">
                            Aucun plan configuré
                        </p>
                    ) : (
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Nom du plan
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Prix Mensuel
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Prix Annuel
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Description
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {plans.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                                            {p.name}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">
                                            <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                                                {typeof p.price === "number" ? p.price.toFixed(2) : p.price} €
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">
                                            <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                                                {typeof p.annual_price === "number" ? p.annual_price.toFixed(2) : p.annual_price} €
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">
                                            <span className="text-gray-500 text-theme-sm dark:text-gray-400 truncate max-w-[200px] block">
                                                {p.description}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-end">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => onEdit(p)}
                                                    className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                    title="Modifier"
                                                >
                                                    <Pencil className="size-5" />
                                                </button>
                                                <button
                                                    onClick={() => onRemove(p.id)}
                                                    className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="size-5" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}
