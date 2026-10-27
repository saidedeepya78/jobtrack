import { useEffect, useState } from 'react';
import { TrashIcon, WarningIcon } from './Icons.jsx';

export default function ConfirmDialog({ application, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !busy) onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, onClose]);

  async function handleConfirm() {
    setBusy(true);
    try {
      const deleted = await onConfirm(application);
      if (deleted) {
        onClose();
        return;
      }
    } catch {
      // The parent shows a detailed error toast; keep this dialog open.
    }
    setBusy(false);
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="modal modal--confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <div className="confirm-dialog__icon" aria-hidden="true">
          <WarningIcon size={25} />
        </div>
        <h2 id="delete-dialog-title">Delete this application?</h2>
        <p id="delete-dialog-description">
          <strong>{application.company}</strong> — {application.role} will be permanently
          removed. This action cannot be undone.
        </p>
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onClose}
            disabled={busy}
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy ? (
              <>
                <span className="spinner spinner--sm" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              <>
                <TrashIcon size={16} />
                Delete application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
