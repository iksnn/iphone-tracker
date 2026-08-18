'use client';
import { useState } from 'react';

export default function RunButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text }

  async function handleRun() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/trigger-scrape', { method: 'POST' });
      const data = await res.json();
      setStatus(
        res.ok
          ? { type: 'success', text: 'Workflow dijalankan' }
          : { type: 'error', text: data.error || 'Gagal menjalankan workflow' }
      );
    } catch {
      setStatus({ type: 'error', text: 'Gagal menjalankan workflow' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="run-control">
      <button className="btn btn-primary" onClick={handleRun} disabled={loading}>
        {loading ? 'Menjalankan…' : 'Cari Listing Baru'}
      </button>
      {status && (
        <p className={`run-status run-status--${status.type}`}>{status.text}</p>
      )}
    </div>
  );
}