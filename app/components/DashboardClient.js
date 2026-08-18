'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import RunButton from './RunButton';
import ListingTable from './ListingTable';

const POLL_INTERVAL_MS = 4000;
const POLL_DURATION_MS = 60000;

export default function DashboardClient() {
  const [listings, setListings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [polling, setPolling] = useState(false);
  const [runStatus, setRunStatus] = useState(null);

  const pollTimer = useRef(null);
  const pollDeadline = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      setListings(data.listings || []);
    } catch {
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    setPolling(false);
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    setPolling(true);
    pollDeadline.current = Date.now() + POLL_DURATION_MS;
    pollTimer.current = setInterval(async () => {
      await loadData();
      if (Date.now() >= pollDeadline.current) {
        stopPolling();
        setRunStatus({ type: 'success', text: 'Data diperbarui' });
      }
    }, POLL_INTERVAL_MS);
  }, [loadData, stopPolling]);

  useEffect(() => stopPolling, [stopPolling]);

  async function handleRun() {
    setSubmitting(true);
    setRunStatus(null);
    try {
      const res = await fetch('/api/trigger-scrape', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setRunStatus({ type: 'info', text: 'Mencari listing baru…' });
        startPolling();
      } else {
        setRunStatus({ type: 'error', text: data.error || 'Gagal menjalankan workflow' });
      }
    } catch {
      setRunStatus({ type: 'error', text: 'Gagal menjalankan workflow' });
    } finally {
      setSubmitting(false);
    }
  }

  function patchListingLocal(id, patch) {
    setListings((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function handleUpdateStatus(id, status) {
    patchListingLocal(id, { status });
    try {
      const res = await fetch('/api/listings/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('failed');
    } catch {
      loadData();
    }
  }

  async function handleUpdateNotes(id, notes) {
    patchListingLocal(id, { notes });
    try {
      const res = await fetch('/api/listings/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('failed');
    } catch {
      loadData();
    }
  }

  const loading = submitting || polling;
  const label = submitting ? 'Menjalankan…' : polling ? 'Mencari listing…' : 'Cari Listing Baru';

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Pemantauan Pasar</p>
          <h1>iPhone Garansi Resmi</h1>
        </div>
        <RunButton onRun={handleRun} loading={loading} label={label} status={runStatus} />
      </header>
      <ListingTable
        listings={listings}
        onUpdateStatus={handleUpdateStatus}
        onUpdateNotes={handleUpdateNotes}
      />
    </>
  );
}