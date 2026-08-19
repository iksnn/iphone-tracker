'use client';
import { useState, useRef, useMemo } from 'react';

const STATUS_OPTIONS = ['belum_dicek', 'nego', 'deal', 'ga_tertarik'];
const STATUS_META = {
  belum_dicek: { label: 'Belum Dicek', color: 'var(--neutral)', tint: 'var(--neutral-tint)' },
  nego: { label: 'Nego', color: 'var(--warning)', tint: 'var(--warning-tint)' },
  deal: { label: 'Deal', color: 'var(--success)', tint: 'var(--success-tint)' },
  ga_tertarik: { label: 'Ga Tertarik', color: 'var(--danger)', tint: 'var(--danger-tint)' },
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const hours = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3600000);
  if (hours < 1) return 'baru saja';
  if (hours < 24) return hours + ' jam lalu';
  return Math.floor(hours / 24) + ' hari lalu';
}

function buildWaLink(phone, title, price) {
  if (!phone) return null;
  const message =
    'Halo, saya tertarik dengan ' + title + ' yang dijual seharga ' + price + '. Apakah masih tersedia?';
  return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
}

function StatusDropdown({ status, onSelect }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[status] || STATUS_META.belum_dicek;

  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
  }

  return (
    <div className="status-dropdown" onBlur={handleBlur}>
      <button
        type="button"
        className="status-dropdown-trigger"
        style={{ '--pill-tint': meta.tint, '--pill-color': meta.color }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="status-dropdown-dot" style={{ '--dot-color': meta.color }} />
        {meta.label}
        <svg className="status-dropdown-chevron" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="#78716C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="status-dropdown-menu" role="listbox" onClick={(e) => e.stopPropagation()}>
          {STATUS_OPTIONS.map((s) => (
            <button
              type="button"
              key={s}
              role="option"
              aria-selected={s === status}
              className="status-dropdown-option"
              onClick={() => {
                onSelect(s);
                setOpen(false);
              }}
            >
              <span className="status-dropdown-dot" style={{ '--dot-color': STATUS_META[s].color }} />
              {STATUS_META[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListingTable({ listings = [], onUpdateStatus, onUpdateNotes }) {
  const [selected, setSelected] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [sortBy, setSortBy] = useState('newest');

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter((item) => {
      const title = (item.title || '').toLowerCase();
      const location = (item.location || '').toLowerCase();
      return title.includes(q) || location.includes(q);
    });
  }, [listings, search]);

  const counts = useMemo(() => {
    const c = { semua: searched.length, belum_dicek: 0, nego: 0, deal: 0, ga_tertarik: 0 };
    for (const item of searched) {
      const s = item.status || 'belum_dicek';
      if (c[s] !== undefined) c[s] += 1;
    }
    return c;
  }, [searched]);

  const filtered = useMemo(() => {
    if (statusFilter === 'semua') return searched;
    return searched.filter((item) => (item.status || 'belum_dicek') === statusFilter);
  }, [searched, statusFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price_amount || 0) - (b.price_amount || 0);
      if (sortBy === 'price_desc') return (b.price_amount || 0) - (a.price_amount || 0);
      const aTime = new Date(a.posted_at || 0).getTime();
      const bTime = new Date(b.posted_at || 0).getTime();
      return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
    });
    return arr;
  }, [filtered, sortBy]);

  function resetFilters() {
    setSearch('');
    setStatusFilter('semua');
  }

  function openDetail(item) {
    setSelected(item);
    setNotesDraft(item.notes || '');
  }

  function closeDetail() {
    setSelected(null);
    setDragY(0);
  }

  function handleSaveNotes() {
    onUpdateNotes(selected.id, notesDraft);
    setSelected((prev) => (prev ? { ...prev, notes: notesDraft } : prev));
  }

  function handleTouchStart(e) {
    dragStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e) {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  }

  function handleTouchEnd() {
    if (dragY > 80) {
      closeDetail();
    } else {
      setDragY(0);
    }
    dragStartY.current = null;
  }

  const waLink = selected
    ? buildWaLink(selected.phone, selected.title, selected.price_formatted)
    : null;
  const selectedMeta = selected ? STATUS_META[selected.status] || STATUS_META.belum_dicek : null;

  const hasAnyListing = listings.length > 0;
  const hasActiveFilter = search.trim() !== '' || statusFilter !== 'semua';

  return (
    <div>
      {hasAnyListing && (
        <>
          <div className="toolbar">
            <div className="search-field">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#78716C" strokeWidth="1.4" />
                <path d="M11.5 11.5L14.5 14.5" stroke="#78716C" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Cari judul atau lokasi…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="sort-select">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-pills">
            <button
              type="button"
              className={`filter-pill ${statusFilter === 'semua' ? 'active' : ''}`}
              style={{ '--pill-tint': 'var(--accent-tint)', '--pill-color': 'var(--accent)' }}
              onClick={() => setStatusFilter('semua')}
            >
              Semua <span className="count">{counts.semua}</span>
            </button>
            {STATUS_OPTIONS.map((s) => (
              <button
                type="button"
                key={s}
                className={`filter-pill ${statusFilter === s ? 'active' : ''}`}
                style={{ '--pill-tint': STATUS_META[s].tint, '--pill-color': STATUS_META[s].color }}
                onClick={() => setStatusFilter(s)}
              >
                {STATUS_META[s].label} <span className="count">{counts[s]}</span>
              </button>
            ))}
          </div>

          <p className="results-meta">
            Menampilkan {sorted.length} dari {listings.length} listing
          </p>
        </>
      )}

      <div className="listing-grid">
        {!hasAnyListing ? (
          <div className="state-panel">
            <div className="state-panel-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="2" width="12" height="20" rx="3" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            Belum ada listing. Klik &quot;Cari Listing Baru&quot; untuk mulai memantau.
          </div>
        ) : sorted.length === 0 ? (
          <div className="state-panel">
            Tidak ada listing yang cocok dengan pencarian atau filter.
            {hasActiveFilter && (
              <div className="state-panel-action">
                <button type="button" className="btn btn-outline btn-sm" onClick={resetFilters}>
                  Hapus Filter
                </button>
              </div>
            )}
          </div>
        ) : (
          sorted.map((item) => {
            const meta = STATUS_META[item.status] || STATUS_META.belum_dicek;
            return (
              <div
                key={item.id}
                className="listing-card"
                role="button"
                tabIndex={0}
                onClick={() => openDetail(item)}
                onKeyDown={(e) => e.key === 'Enter' && openDetail(item)}
              >
                <div className="card-media">
                  {item.photo_url ? (
                    <img src={item.photo_url} alt="" />
                  ) : (
                    <div className="card-media-placeholder">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <rect x="6" y="2" width="12" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                  )}
                  <span className="card-status-badge" style={{ '--status-color': meta.color }}>
                    <span className="dot" />
                    {meta.label}
                  </span>
                  <span className="card-price-chip">{item.price_formatted}</span>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-meta">
                    {item.location} · {timeAgo(item.posted_at)}
                  </p>
                  <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                    <StatusDropdown
                      status={item.status || 'belum_dicek'}
                      onSelect={(status) => onUpdateStatus(item.id, status)}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
          >
            <div
              className="modal-handle"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
            {selected.photo_url && <img className="modal-image" src={selected.photo_url} alt="" />}
            <div className="modal-body">
              <div className="modal-header">
                <div>
                  <h2>{selected.title}</h2>
                  <p className="modal-price">{selected.price_formatted}</p>
                </div>
                <span
                  className="badge"
                  style={{ '--status-color': selectedMeta.color, '--pill-tint': selectedMeta.tint }}
                >
                  <span className="badge-dot" />
                  {selectedMeta.label}
                </span>
              </div>

              <p className="modal-meta">
                {selected.location} · {timeAgo(selected.posted_at)}
              </p>

              <p className="modal-description">{selected.description}</p>

              {selected.reason && (
                <p className="modal-reason">
                  <strong>Alasan lolos filter:</strong> {selected.reason}
                </p>
              )}

              <div className="modal-actions">
                {waLink && (
                  <a className="btn btn-primary" href={waLink} target="_blank" rel="noreferrer">
                    Chat WhatsApp
                  </a>
                )}
                <a className="btn btn-outline" href={selected.listing_url} target="_blank" rel="noreferrer">
                  Buka di Facebook
                </a>
              </div>
              {!waLink && (
                <p className="modal-note">Nomor HP tidak ditemukan di deskripsi. Hubungi lewat tombol di atas.</p>
              )}

              <div className="modal-notes">
                <label htmlFor="notes">Catatan Pribadi</label>
                <textarea
                  id="notes"
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={3}
                />
                <div className="modal-notes-actions">
                  <button className="btn btn-primary btn-sm" onClick={handleSaveNotes}>
                    Simpan Catatan
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={closeDetail}>
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}