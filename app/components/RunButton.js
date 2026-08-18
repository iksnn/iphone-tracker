'use client';
import { useState } from 'react';

export default function RunButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleRun() {
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/trigger-scrape', { method: 'POST' });
    const data = await res.json();
    setMessage(res.ok ? 'Workflow dijalankan!' : data.error);
    setLoading(false);
  }

  return (
    <div>
      <button onClick={handleRun} disabled={loading}>
        {loading ? 'Menjalankan...' : 'Cari Listing Baru'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}