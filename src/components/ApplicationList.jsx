import { STATUS_META } from '../lib/constants.js';
import {
  formatDisplayDate,
  initials,
  safeHttpUrl,
} from '../lib/format.js';
import {
  CalendarIcon,
  ExternalLinkIcon,
  FolderIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from './Icons.jsx';

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.Applied;
  return <span className={`status-badge ${meta.className}`}>{meta.label}</span>;
}

function SampleBadge() {
  return <span className="sample-badge">Sample</span>;
}

function CompanyIdentity({ application, headingId }) {
  return (
    <div className="company-cell">
      <span className="company-avatar" aria-hidden="true">
        {initials(application.company)}
      </span>
      <div className="company-cell__text">
        <div className="company-name-line">
          {headingId ? (
            <h3 className="company-name" id={headingId}>
              {application.company}
            </h3>
          ) : (
            <span className="company-name">{application.company}</span>
          )}
          {application.isSample && <SampleBadge />}
        </div>
        {safeHttpUrl(application.jobUrl) && (
          <a
            className="job-link"
            href={safeHttpUrl(application.jobUrl)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View job posting for ${application.company} (opens in a new tab)`}
          >
            View posting <ExternalLinkIcon size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  hasActiveFilters,
  onClearFilters,
  onAdd,
  onLoadSamples,
  loadingSamples,
}) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        {hasActiveFilters ? <SearchIcon size={26} /> : <FolderIcon size={26} />}
      </span>
      <h3>{hasActiveFilters ? 'No matching applications' : 'No applications yet'}</h3>
      <p>
        {hasActiveFilters
          ? 'No applications match your search and status filters. Try a different search or clear the filters.'
          : 'Start tracking your job search by adding your first application, or load a few sample records to explore the dashboard.'}
      </p>
      <div className="empty-state__actions">
        {hasActiveFilters ? (
          <>
            <button type="button" className="btn btn--secondary" onClick={onClearFilters}>
              Clear search &amp; filters
            </button>
            <button type="button" className="btn btn--primary" onClick={onAdd}>
              <PlusIcon size={17} />
              Add application
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn--primary" onClick={onAdd}>
              <PlusIcon size={17} />
              Add your first application
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onLoadSamples}
              disabled={loadingSamples}
            >
              {loadingSamples ? (
                <>
                  <span className="spinner spinner--sm spinner--dark" aria-hidden="true" />
                  Loading samples…
                </>
              ) : (
                'Load sample records'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ApplicationList({
  applications,
  hasActiveFilters,
  onClearFilters,
  onAdd,
  onEdit,
  onDelete,
  onLoadSamples,
  loadingSamples,
}) {
  if (applications.length === 0) {
    return (
      <EmptyState
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        onAdd={onAdd}
        onLoadSamples={onLoadSamples}
        loadingSamples={loadingSamples}
      />
    );
  }

  return (
    <>
      <div className="table-wrap">
        <table className="application-table">
          <caption className="sr-only">
            Job and internship applications on your JobTrack dashboard
          </caption>
          <thead>
            <tr>
              <th scope="col">Company</th>
              <th scope="col">Role</th>
              <th scope="col">Applied</th>
              <th scope="col">Status</th>
              <th scope="col" className="col-actions">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>
                  <CompanyIdentity application={application} />
                </td>
                <td className="role-cell">{application.role}</td>
                <td className="date-cell">{formatDisplayDate(application.applicationDate)}</td>
                <td>
                  <StatusBadge status={application.status} />
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => onEdit(application)}
                      aria-label={`Edit application for ${application.company}`}
                      title="Edit"
                    >
                      <PencilIcon size={17} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn icon-btn--danger"
                      onClick={() => onDelete(application)}
                      aria-label={`Delete application for ${application.company}`}
                      title="Delete"
                    >
                      <TrashIcon size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="application-cards" aria-label="Job applications">
        {applications.map((application) => (
          <article className="application-card" key={application.id}>
            <div className="application-card__top">
              <CompanyIdentity
                application={application}
                headingId={`mobile-company-${application.id}`}
              />
              <StatusBadge status={application.status} />
            </div>

            <p className="application-card__role">{application.role}</p>

            <div className="application-card__meta">
              <span className="application-card__date">
                <CalendarIcon size={14} />
                Applied {formatDisplayDate(application.applicationDate)}
              </span>
              {safeHttpUrl(application.jobUrl) && (
                <a
                  className="job-link"
                  href={safeHttpUrl(application.jobUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View job posting for ${application.company} (opens in a new tab)`}
                >
                  View posting <ExternalLinkIcon size={12} />
                </a>
              )}
            </div>

            <div className="application-card__actions">
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => onEdit(application)}
                aria-label={`Edit application for ${application.company}`}
              >
                <PencilIcon size={15} />
                Edit
              </button>
              <button
                type="button"
                className="btn btn--ghost-danger btn--sm"
                onClick={() => onDelete(application)}
                aria-label={`Delete application for ${application.company}`}
              >
                <TrashIcon size={15} />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
