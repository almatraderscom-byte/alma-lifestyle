'use client';

import { useState } from 'react';

interface DeleteConfirmModalProps {
  title: string;
  description: string;
  confirmText?: string;
  warningPoints?: string[];
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  title,
  description,
  confirmText = 'DELETE',
  warningPoints = [],
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const [typedText, setTypedText] = useState('');
  const [loading, setLoading] = useState(false);

  const canConfirm = typedText === confirmText;

  async function handleConfirm() {
    if (!canConfirm) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <span className="text-3xl" aria-hidden>
            ⚠️
          </span>
          <div>
            <h3 id="delete-modal-title" className="text-lg font-bold text-neutral-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-neutral-600">{description}</p>
          </div>
        </div>

        {warningPoints.length > 0 && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3">
            <p className="mb-2 text-sm font-medium text-red-900">This will:</p>
            <ul className="space-y-1 text-sm text-red-800">
              {warningPoints.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Type{' '}
            <code className="rounded bg-neutral-100 px-2 py-0.5 font-bold text-red-600">
              {confirmText}
            </code>{' '}
            to confirm:
          </label>
          <input
            type="text"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder={confirmText}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded border border-neutral-300 px-4 py-2 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!canConfirm || loading}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Deleting…' : 'Delete permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
