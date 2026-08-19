'use client';
import { useState, useEffect, useCallback } from 'react';
import RunButton from './RunButton';
import ListingTable from './ListingTable';

export default function DashboardClient() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [runStatus, setRunStatus] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      setListings(data.listings || []);
    } catch {
      // gagal diam-diam saat refresh latar belakang
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function messageForSummary(s) {
    if (s.lolos === 0) {
      return {
        type: 'info',
        text: `${s.total} listing diperiksa, tidak ada yang garansi resmi (${s.ditolak} ditolak)`,
      };
    }
    return {
      type: 'success',
      text: `${s.lolos} listing garansi resmi ditemukan dari ${s.total} diperiksa`,
    };
  }

  async function handleRun() {
    setLoading(true);
    setRunStatus(null);
    try {
      const res = await fetch('/api/trigger-scrape', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setRunStatus({ type: 'error', text: data.error || 'Gagal menjalankan workflow' });
      } else {
        setRunStatus(messageForSummary(data.summary));
        await loadData();
      }
    } catch {
      setRunStatus({ type: 'error', text: 'Gagal menghubungi workflow' });
    } finally {
      setLoading(false);
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

  const label = loading ? 'Menjalankan… (bisa beberapa menit)' : 'Cari Listing Baru';

  return (
    <>
      <header className="page-header">
        <div className="title-block">
          <div className="title-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="2" width="12" height="20" rx="3" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10 18h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="eyebrow">Pemantauan Marketplace</p>
            <h1>iPhone Garansi Resmi</h1>
          </div>
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