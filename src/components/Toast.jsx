import { CheckCircleIcon, CloseIcon, InfoIcon, WarningIcon } from './Icons.jsx';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const Icon = toast.type === 'success' ? CheckCircleIcon : toast.type === 'info' ? InfoIcon : WarningIcon;

  return (
    <div className="toast-wrap">
      <div
        key={toast.id}
        className={`toast toast--${toast.type}`}
        role={toast.type === 'error' ? 'alert' : 'status'}
        aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      >
        <span className="toast__icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        <p className="toast__message">{toast.message}</p>
        <button className="toast__close" type="button" onClick={onClose} aria-label="Dismiss notification">
          <CloseIcon size={16} />
        </button>
      </div>
    </div>
  );
}
