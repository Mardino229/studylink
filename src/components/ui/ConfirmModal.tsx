import React from 'react';
import { Modal } from './modal/index.tsx';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<unknown> | void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="max-w-lg p-6">
      <div className="flex flex-col gap-4">
        {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={async () => { await onConfirm(); }}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
