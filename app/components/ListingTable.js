'use client';
import { useState, useRef } from 'react';

const STATUS_OPTIONS = ['belum_dicek', 'nego', 'deal', 'ga_tertarik'];
const STATUS_META = {
  belum_dicek: { label: 'Belum Dicek', color: 'var(--neutral)' },
  nego: { label: 'Nego', color: 'var(--warning)' },
  deal: { label: 'Deal', color: 'var(--success)' },
  ga_tertarik: { label: 'Ga Tertarik', color: 'var(--danger)' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const hours = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3600000);
  if (hours < 1) return 'baru saja';
  if (hours < 24) return hours + ' jam lalu';
  return Math.floor(hours / 24) + ' hari lalu';
}

function buildWaLink(phone, title, price) {
  if (!phone) return null;
  const message = 'Halo, saya tertarik dengan ' + title + ' yang dijual seharga ' + price + '. Apakah masih tersedia?';
  return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
}

export default function ListingTable({ listings, onChange }) {
  const [selected, setSelected] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef(null);

  async function updateStatus(id, status) {
    await fetch('/api/listings/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    onChange();
  }

  async function saveNotes() {
    await fetch('/api/listings/' + selected.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: notesDraft }),
    });
    setSelected((prev) => ({ ...prev, notes: notesDraft }));
    onChange();
  }

  function openDetail(item) {
    setSelected(item);
    setNotesDraft(item.notes || '');
  }

  function closeDetail() {
    setSelected(null);
    setDragY(0);
  }

  function handleHandleTouchStart(e) {
    dragStartY.current = e.touches[0].clientY;
  }

  function handleHandleTouchMove(e) {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  }

  function handleHandleTouchEnd() {
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
  const selectedMeta = selected
    ? STATUS_META[selected.status] || STATUS_META.belum_dicek
    : null;

  return (
    <div>
      <div className="table-scroll">
        <table className="listing-table">
          <thead>
            <tr>
              <th className="col-photo"></th>
              <th>Judul</th>
              <th>Harga</th>
              <th className="col-location">Lokasi</th>
              <th className="col-age">Umur</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  Belum ada listing. Klik &quot;Cari Listing Baru&quot; untuk mulai memantau.
                </td>
              </tr>
            ) : (
              listings.map((item) => {
                const meta = STATUS_META[item.status] || STATUS_META.belum_dicek;
                return (
                  <tr key={item.id} onClick={() => openDetail(item)}>
                    <td className="col-photo">
                      {item.photo_url && <img className="thumb" src={item.photo_url} alt="" />}
                    </td>
                    <td className="col-title">{item.title}</td>
                    <td className="col-price">{item.price_formatted}</td>
                    <td className="col-location">{item.location}</td>
                    <td className="col-age">{timeAgo(item.posted_at)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="status-select" style={{ '--status-color': meta.color }}>
                        <select
                          value={item.status || 'belum_dicek'}
                          onChange={(e) => updateStatus(item.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_META[s].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
              onTouchStart={handleHandleTouchStart}
              onTouchMove={handleHandleTouchMove}
              onTouchEnd={handleHandleTouchEnd}
            />
            {selected.photo_url && (
              <img className="modal-image" src={selected.photo_url} alt="" />
            )}
            <div className="modal-body">
              <div className="modal-header">
                <div>
                  <h2>{selected.title}</h2>
                  <p className="modal-price">{selected.price_formatted}</p>
                </div>
                <span className="badge" style={{ '--status-color': selectedMeta.color }}>
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
                
                  className="btn btn-outline"
                  href={selected.listing_url}
                  target="_blank"
                  rel="noreferrer"
                <a>
                  Buka di Facebook
                </a>
              </div>
              {!waLink && (
                <p className="modal-note">
                  Nomor HP tidak ditemukan di deskripsi. Hubungi lewat tombol di atas.
                </p>
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
                  <button className="btn btn-primary btn-sm" onClick={saveNotes}>
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