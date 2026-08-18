'use client';

export default function RunButton({ onRun, loading, label, status }) {
  return (
    <div className="run-control">
      <button className="btn btn-primary" onClick={onRun} disabled={loading}>
        {loading && <span className="spinner" aria-hidden="true" />}
        {label}
      </button>
      <p className={`run-status ${status ? `run-status--${status.type}` : ''}`}>
        {status ? status.text : '\u00A0'}
      </p>
    </div>
  );
}