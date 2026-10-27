import { useEffect, useState } from 'react';
import { STATUSES } from '../lib/constants.js';
import { todayISO } from '../lib/format.js';
import { normalizeApplication, validateApplication } from '../lib/validation.js';
import { CloseIcon, InfoIcon, PlusIcon } from './Icons.jsx';

export default function ApplicationForm({ application, onClose, onSave }) {
  const isEditing = Boolean(application);
  const today = todayISO();
  const [values, setValues] = useState(() => ({
    company: application?.company || '',
    role: application?.role || '',
    jobUrl: application?.jobUrl || '',
    applicationDate: application?.applicationDate || today,
    status: application?.status || 'Applied',
  }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !submitting) onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, submitting]);

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (formError) setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateApplication(values);
    const errorFields = Object.keys(nextErrors);

    if (errorFields.length > 0) {
      setErrors(nextErrors);
      setFormError('Please fix the highlighted fields and try again.');
      document.getElementById(`field-${errorFields[0]}`)?.focus();
      return;
    }

    setFormError('');
    setSubmitting(true);

    try {
      const saved = await onSave(normalizeApplication(values));
      if (saved) {
        onClose();
        return;
      }
    } catch {
      setFormError('Something went wrong while saving. Please try again.');
    }

    setSubmitting(false);
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-form-title"
        aria-describedby="application-form-description"
      >
        <div className="modal__header">
          <div>
            <h2 id="application-form-title">
              {isEditing ? 'Edit application' : 'Add application'}
            </h2>
            <p id="application-form-description">
              {isEditing
                ? 'Update the details for this opportunity.'
                : 'Track a new job or internship in a few seconds.'}
            </p>
          </div>
          <button
            type="button"
            className="icon-btn modal__close"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={submitting}
          >
            <CloseIcon size={19} />
          </button>
        </div>

        {isEditing && application?.isSample && (
          <div className="sample-note">
            <InfoIcon size={16} />
            <span>
              This is a labeled sample record. Your edits will keep the{' '}
              <span className="sample-badge">Sample</span> label.
            </span>
          </div>
        )}

        <form className="modal__form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className={`field${errors.company ? ' field--invalid' : ''}`}>
              <label htmlFor="field-company">
                Company <span className="required" aria-hidden="true">*</span>
              </label>
              <input
                id="field-company"
                name="company"
                type="text"
                value={values.company}
                onChange={(event) => updateField('company', event.target.value)}
                placeholder="e.g. Nimbus Labs"
                maxLength={120}
                autoComplete="organization"
                autoFocus
                required
                aria-invalid={Boolean(errors.company)}
                aria-describedby={errors.company ? 'company-error' : undefined}
              />
              {errors.company && (
                <p className="field__error" id="company-error">
                  {errors.company}
                </p>
              )}
            </div>

            <div className={`field${errors.role ? ' field--invalid' : ''}`}>
              <label htmlFor="field-role">
                Role <span className="required" aria-hidden="true">*</span>
              </label>
              <input
                id="field-role"
                name="role"
                type="text"
                value={values.role}
                onChange={(event) => updateField('role', event.target.value)}
                placeholder="e.g. Frontend Developer Intern"
                maxLength={120}
                autoComplete="off"
                required
                aria-invalid={Boolean(errors.role)}
                aria-describedby={errors.role ? 'role-error' : undefined}
              />
              {errors.role && (
                <p className="field__error" id="role-error">
                  {errors.role}
                </p>
              )}
            </div>
          </div>

          <div className={`field${errors.jobUrl ? ' field--invalid' : ''}`}>
            <label htmlFor="field-jobUrl">Job posting URL</label>
            <input
              id="field-jobUrl"
              name="jobUrl"
              type="url"
              inputMode="url"
              value={values.jobUrl}
              onChange={(event) => updateField('jobUrl', event.target.value)}
              placeholder="https://company.com/jobs/role"
              maxLength={500}
              autoComplete="url"
              aria-invalid={Boolean(errors.jobUrl)}
              aria-describedby={errors.jobUrl ? 'jobUrl-error' : 'jobUrl-hint'}
            />
            {errors.jobUrl ? (
              <p className="field__error" id="jobUrl-error">
                {errors.jobUrl}
              </p>
            ) : (
              <p className="field__hint" id="jobUrl-hint">
                Optional. Include the full URL starting with https://.
              </p>
            )}
          </div>

          <div className="form-row">
            <div className={`field${errors.applicationDate ? ' field--invalid' : ''}`}>
              <label htmlFor="field-applicationDate">
                Application date <span className="required" aria-hidden="true">*</span>
              </label>
              <input
                id="field-applicationDate"
                name="applicationDate"
                type="date"
                value={values.applicationDate}
                onChange={(event) => updateField('applicationDate', event.target.value)}
                max={today}
                required
                aria-invalid={Boolean(errors.applicationDate)}
                aria-describedby={errors.applicationDate ? 'applicationDate-error' : undefined}
              />
              {errors.applicationDate && (
                <p className="field__error" id="applicationDate-error">
                  {errors.applicationDate}
                </p>
              )}
            </div>

            <div className={`field${errors.status ? ' field--invalid' : ''}`}>
              <label htmlFor="field-status">
                Status <span className="required" aria-hidden="true">*</span>
              </label>
              <select
                id="field-status"
                name="status"
                value={values.status}
                onChange={(event) => updateField('status', event.target.value)}
                required
                aria-invalid={Boolean(errors.status)}
                aria-describedby={errors.status ? 'status-error' : undefined}
              >
                {STATUSES.map((status) => (
                  <option value={status} key={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="field__error" id="status-error">
                  {errors.status}
                </p>
              )}
            </div>
          </div>

          {formError && (
            <div className="form-alert" role="alert">
              {formError}
            </div>
          )}

          <div className="modal__footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner spinner--sm" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  <PlusIcon size={17} />
                  {isEditing ? 'Save changes' : 'Add application'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
