import { InfoIcon, RefreshIcon, WarningIcon } from './Icons.jsx';

function RemoveSamplesButton({ sampleCount, busy, onRemoveSamples }) {
  if (sampleCount === 0) return null;

  return (
    <button
      type="button"
      className="btn btn--ghost btn--sm"
      onClick={onRemoveSamples}
      disabled={busy}
    >
      {busy ? 'Removing…' : `Remove ${sampleCount} sample${sampleCount === 1 ? '' : 's'}`}
    </button>
  );
}

export default function ModeBanner({
  mode,
  loading,
  fallbackError,
  sampleCount,
  samplesBusy,
  onRemoveSamples,
  onRetry,
  retrying,
}) {
  if (loading || mode === 'checking') return null;

  if (mode === 'supabase') {
    if (sampleCount === 0) return null;

    return (
      <div className="mode-banner mode-banner--success" role="status">
        <span className="mode-banner__icon" aria-hidden="true">
          <InfoIcon size={19} />
        </span>
        <div className="mode-banner__body">
          <strong>Connected to Supabase</strong>
          <p>
            Database storage is active. {sampleCount} sample record{sampleCount === 1 ? ' is' : 's are'}{' '}
            clearly labeled <span className="sample-badge">Sample</span> and can be removed anytime.
          </p>
        </div>
        <div className="mode-banner__actions">
          <RemoveSamplesButton
            sampleCount={sampleCount}
            busy={samplesBusy}
            onRemoveSamples={onRemoveSamples}
          />
        </div>
      </div>
    );
  }

  if (fallbackError) {
    return (
      <div className="mode-banner mode-banner--warning" role="status">
        <span className="mode-banner__icon" aria-hidden="true">
          <WarningIcon size={19} />
        </span>
        <div className="mode-banner__body">
          <strong>Supabase unavailable — demo fallback active</strong>
          <p>
            {fallbackError} Changes are saved only in this browser&apos;s localStorage.{' '}
            <b>localStorage is not a backend.</b>
          </p>
        </div>
        <div className="mode-banner__actions">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={onRetry}
            disabled={retrying}
          >
            <RefreshIcon size={15} />
            {retrying ? 'Retrying…' : 'Retry connection'}
          </button>
          <RemoveSamplesButton
            sampleCount={sampleCount}
            busy={samplesBusy}
            onRemoveSamples={onRemoveSamples}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mode-banner mode-banner--info" role="status">
      <span className="mode-banner__icon" aria-hidden="true">
        <InfoIcon size={19} />
      </span>
      <div className="mode-banner__body">
        <strong>Demo mode — browser storage only</strong>
        <p>
          Supabase is not configured. Changes are saved in this browser&apos;s localStorage;{' '}
          <b>localStorage is not a backend.</b>{' '}
          {sampleCount > 0 ? (
            <>
              Sample records are labeled <span className="sample-badge">Sample</span>. Add your
              credentials to <code>.env.local</code> to use a real database.
            </>
          ) : (
            <>
              Add your credentials to <code>.env.local</code> to use a real database.
            </>
          )}
        </p>
      </div>
      <div className="mode-banner__actions">
        <RemoveSamplesButton
          sampleCount={sampleCount}
          busy={samplesBusy}
          onRemoveSamples={onRemoveSamples}
        />
      </div>
    </div>
  );
}
