import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ApplicationForm from './components/ApplicationForm.jsx';
import ApplicationList from './components/ApplicationList.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import {
  BriefcaseIcon,
  CloseIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  SparkleIcon,
  WarningIcon,
} from './components/Icons.jsx';
import ModeBanner from './components/ModeBanner.jsx';
import StatsCards from './components/StatsCards.jsx';
import Toast from './components/Toast.jsx';
import { ALL_STATUSES, STATUSES, STATUS_META } from './lib/constants.js';
import { initDataStore } from './lib/dataStore.js';

function ConnectionPill({ mode, fallbackError }) {
  let modifier = 'checking';
  let label = 'Connecting…';
  let title = 'Checking the data connection';

  if (mode === 'supabase') {
    modifier = 'live';
    label = 'Supabase connected';
    title = 'Data is stored in your Supabase database';
  } else if (mode === 'local') {
    modifier = fallbackError ? 'warning' : 'demo';
    label = fallbackError ? 'Demo fallback' : 'Demo mode';
    title = fallbackError
      ? fallbackError
      : 'Demo mode: data is stored only in this browser (localStorage)';
  }

  return (
    <span
      className={`connection-pill connection-pill--${modifier}`}
      title={title}
      aria-label={title}
      role="status"
    >
      <span className="connection-pill__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="spinner spinner--lg" aria-hidden="true" />
      <p>Loading applications…</p>
    </div>
  );
}

function LoadErrorState({ message, onRetry, retrying }) {
  return (
    <div className="load-error" role="alert">
      <span className="load-error__icon" aria-hidden="true">
        <WarningIcon size={24} />
      </span>
      <h3>Could not load applications</h3>
      <p>{message}</p>
      <button
        type="button"
        className="btn btn--secondary"
        onClick={onRetry}
        disabled={retrying}
      >
        <RefreshIcon size={16} />
        {retrying ? 'Trying again…' : 'Try again'}
      </button>
    </div>
  );
}

function sortApplications(applications) {
  return [...applications].sort((a, b) => {
    const dateComparison = String(b.applicationDate || '').localeCompare(
      String(a.applicationDate || ''),
    );
    if (dateComparison !== 0) return dateComparison;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
}

export default function App() {
  const [store, setStore] = useState(null);
  const [mode, setMode] = useState('checking');
  const [fallbackError, setFallbackError] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [formOpen, setFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [samplesBusy, setSamplesBusy] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  const showToast = useCallback((type, message) => {
    clearTimeout(toastTimer.current);
    setToast({ id: `${Date.now()}-${Math.random()}`, type, message });
    toastTimer.current = setTimeout(
      () => setToast(null),
      type === 'error' ? 7000 : 4500,
    );
  }, []);

  const boot = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    setMode('checking');

    try {
      const result = await initDataStore();
      setStore(result.store);
      setMode(result.mode);
      setFallbackError(result.fallback ? result.error : '');

      const records = await result.store.list();
      setApplications(records);
    } catch (error) {
      setLoadError(error?.message || 'An unexpected error prevented loading your applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    boot();
  }, [boot]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await boot();
    setRetrying(false);
  }, [boot]);

  const openAdd = useCallback(() => {
    setEditingApplication(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((application) => {
    setEditingApplication(application);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => setFormOpen(false), []);
  const closeDelete = useCallback(() => setDeleteTarget(null), []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter(ALL_STATUSES);
  }, []);

  async function saveApplication(values) {
    if (!store) {
      showToast('error', 'The application tracker is still loading. Please try again.');
      return false;
    }

    try {
      if (editingApplication) {
        const updated = await store.update(editingApplication.id, values);
        setApplications((current) =>
          current.map((application) =>
            application.id === updated.id ? updated : application,
          ),
        );
        showToast('success', `Changes saved for ${updated.company}.`);
      } else {
        const created = await store.create(values);
        setApplications((current) => [created, ...current]);
        showToast('success', `Application for ${created.company} added.`);
      }
      return true;
    } catch (error) {
      showToast('error', error?.message || 'Could not save the application. Please try again.');
      return false;
    }
  }

  async function deleteApplication(application) {
    if (!store) {
      showToast('error', 'The application tracker is still loading. Please try again.');
      return false;
    }

    try {
      await store.remove(application.id);
      setApplications((current) =>
        current.filter((item) => item.id !== application.id),
      );
      showToast('success', `Application for ${application.company} deleted.`);
      return true;
    } catch (error) {
      showToast('error', error?.message || 'Could not delete the application. Please try again.');
      return false;
    }
  }

  async function loadSamples() {
    if (!store || samplesBusy) return;

    setSamplesBusy(true);
    try {
      const added = await store.addSamples();
      if (added.length === 0) {
        showToast('info', 'Sample records are already loaded.');
        return;
      }

      setApplications((current) => [...added, ...current]);
      setSearch('');
      setStatusFilter(ALL_STATUSES);
      showToast(
        'success',
        `${added.length} sample applications added. Look for the Sample label.`,
      );
    } catch (error) {
      showToast('error', error?.message || 'Could not load sample records.');
    } finally {
      setSamplesBusy(false);
    }
  }

  async function removeSamples() {
    if (!store || samplesBusy) return;

    setSamplesBusy(true);
    try {
      const removed = await store.removeSamples();
      setApplications((current) =>
        current.filter((application) => !application.isSample),
      );
      showToast(
        removed > 0 ? 'success' : 'info',
        removed > 0
          ? `${removed} sample record${removed === 1 ? '' : 's'} removed. Your own applications were not changed.`
          : 'There are no sample records to remove.',
      );
    } catch (error) {
      showToast('error', error?.message || 'Could not remove sample records.');
    } finally {
      setSamplesBusy(false);
    }
  }

  const stats = useMemo(() => {
    let interviews = 0;
    let offers = 0;
    let rejections = 0;

    for (const application of applications) {
      if (application.status === 'Interview') interviews += 1;
      else if (application.status === 'Offer') offers += 1;
      else if (application.status === 'Rejected') rejections += 1;
    }

    return {
      total: applications.length,
      interviews,
      offers,
      rejections,
    };
  }, [applications]);

  const statusCounts = useMemo(() => {
    const counts = { [ALL_STATUSES]: applications.length };
    for (const status of STATUSES) counts[status] = 0;
    for (const application of applications) {
      if (Object.hasOwn(counts, application.status)) {
        counts[application.status] += 1;
      }
    }
    return counts;
  }, [applications]);

  const sampleCount = useMemo(
    () => applications.filter((application) => application.isSample).length,
    [applications],
  );

  const visibleApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = applications.filter((application) => {
      const matchesStatus =
        statusFilter === ALL_STATUSES || application.status === statusFilter;
      const matchesQuery =
        !query ||
        application.company.toLowerCase().includes(query) ||
        application.role.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });

    return sortApplications(filtered);
  }, [applications, search, statusFilter]);

  const hasActiveFilters = search.trim().length > 0 || statusFilter !== ALL_STATUSES;
  const addDisabled = loading || Boolean(loadError);
  const sourceLabel =
    mode === 'supabase'
      ? 'Supabase'
      : mode === 'local'
        ? fallbackError
          ? 'Browser localStorage (demo fallback)'
          : 'Browser localStorage (demo)'
        : 'Connecting…';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar__inner">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">
              <BriefcaseIcon size={21} />
            </span>
            <span className="brand__text">
              <span className="brand__name">JobTrack</span>
              <span className="brand__tagline">Student career tracker</span>
            </span>
          </div>
          <ConnectionPill mode={mode} fallbackError={fallbackError} />
        </div>
      </header>

      <main className="container main" id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <span className="eyebrow">
              <SparkleIcon size={14} />
              College career dashboard
            </span>
            <h1 id="hero-title">
              Track every application.
              <span>Land your next role.</span>
            </h1>
            <p>
              One focused workspace for internships and early-career roles — from your first
              application to the final offer.
            </p>
          </div>
          <div className="hero__action">
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={openAdd}
              disabled={addDisabled}
            >
              <PlusIcon size={19} />
              Add application
            </button>
          </div>
        </section>

        <ModeBanner
          mode={mode}
          loading={loading || Boolean(loadError)}
          fallbackError={fallbackError}
          sampleCount={sampleCount}
          samplesBusy={samplesBusy}
          onRemoveSamples={removeSamples}
          onRetry={handleRetry}
          retrying={retrying}
        />

        <StatsCards stats={stats} loading={loading} />

        <section className="panel" id="applications" aria-labelledby="applications-heading">
          <div className="panel__header">
            <div>
              <h2 id="applications-heading">Applications</h2>
              <p>Manage every opportunity from applied to offer.</p>
            </div>
            <span className="count-pill">
              {loading
                ? 'Loading…'
                : `${visibleApplications.length} of ${applications.length} shown`}
            </span>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <SearchIcon size={18} className="search-box__icon" />
              <label htmlFor="application-search" className="sr-only">
                Search applications by company or role
              </label>
              <input
                id="application-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by company or role…"
                autoComplete="off"
                spellCheck="false"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <CloseIcon size={15} />
                </button>
              )}
            </div>

            <div className="filter-chips" role="group" aria-label="Filter applications by status">
              {[ALL_STATUSES, ...STATUSES].map((status) => {
                const label = status === ALL_STATUSES ? 'All' : STATUS_META[status].label;
                return (
                  <button
                    type="button"
                    key={status}
                    className={`filter-chip${statusFilter === status ? ' is-active' : ''}`}
                    aria-pressed={statusFilter === status}
                    onClick={() => setStatusFilter(status)}
                  >
                    {label}
                    <span className="filter-chip__count">{statusCounts[status] ?? 0}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            {loading
              ? 'Loading applications.'
              : `${visibleApplications.length} applications currently shown.`}
          </p>

          {loading ? (
            <LoadingState />
          ) : loadError ? (
            <LoadErrorState message={loadError} onRetry={handleRetry} retrying={retrying} />
          ) : (
            <ApplicationList
              applications={visibleApplications}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              onAdd={openAdd}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onLoadSamples={loadSamples}
              loadingSamples={samplesBusy}
            />
          )}
        </section>

        <footer className="footer">
          <p>JobTrack — a focused application tracker for college students.</p>
          <p className="footer__meta">
            <span className="footer__dot" aria-hidden="true" />
            Data source: {sourceLabel}
          </p>
        </footer>
      </main>

      {formOpen && (
        <ApplicationForm
          key={editingApplication?.id || 'new-application'}
          application={editingApplication}
          onClose={closeForm}
          onSave={saveApplication}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          application={deleteTarget}
          onClose={closeDelete}
          onConfirm={deleteApplication}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
