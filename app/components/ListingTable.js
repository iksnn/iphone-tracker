'use client';
import { useState, useEffect } from 'react';

const STATUS_OPTIONS = ['belum_dicek', 'nego', 'deal', 'ga_tertarik'];
const STATUS_LABEL = { belum_dicek: 'Belum Dicek', nego: 'Nego', deal: 'Deal', ga_tertarik: 'Ga Tertarik' };
const STATUS_COLOR = { belum_dicek: '#8a8177', nego: '#c9895f', deal: '#4a9', ga_tertarik: '#a55' };

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

export default function ListingTable() {
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');

  async function loadData() {
    const res = await fetch('/api/listings');
    const data = await res.json();
    setListings(data.listings || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function updateStatus(id, status) {
    await fetch('/api/listings/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status }),
    });
    loadData();
  }

  async function saveNotes() {
    await fetch('/api/listings/' + selected.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: notesDraft }),
    });
    setSelected(Object.assign({}, selected, { notes: notesDraft }));
    loadData();
  }

  function openDetail(item) {
    setSelected(item);
    setNotesDraft(item.notes || '');
  }

  const waLink = selected ? buildWaLink(selected.phone, selected.title, selected.price_formatted) : null;

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2a2521', textAlign: 'left' }}>
            <th style={{ padding: '10px 8px', width: 60 }}></th>
            <th style={{ padding: '10px 8px' }}>Judul</th>
            <th style={{ padding: '10px 8px' }}>Harga</th>
            <th style={{ padding: '10px 8px' }}>Lokasi</th>
            <th style={{ padding: '10px 8px' }}>Umur</th>
            <th style={{ padding: '10px 8px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {listings.map(function (item) {
            return (
              <tr
                key={item.id}
                onClick={function () { openDetail(item); }}
                style={{ borderBottom: '1px solid #221e1b', cursor: 'pointer' }}
              >
                <td style={{ padding: 8 }}>
                  {item.photo_url && (
                    <img src={item.photo_url} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                  )}
                </td>
                <td style={{ padding: 8 }}>{item.title}</td>
                <td style={{ padding: 8, color: '#c9895f', fontWeight: 600 }}>{item.price_formatted}</td>
                <td style={{ padding: 8, color: '#8a8177' }}>{item.location}</td>
                <td style={{ padding: 8, color: '#8a8177' }}>{timeAgo(item.posted_at)}</td>
                <td style={{ padding: 8 }} onClick={function (e) { e.stopPropagation(); }}>
                  <select
                    value={item.status || 'belum_dicek'}
                    onChange={function (e) { updateStatus(item.id, e.target.value); }}
                    style={{ background: '#1a1613', color: STATUS_COLOR[item.status] || '#8a8177', border: '1px solid #2a2521', borderRadius: 6, padding: '4px 8px' }}
                  >
                    {STATUS_OPTIONS.map(function (s) {
                      return <option key={s} value={s}>{STATUS_LABEL[s]}</option>;
                    })}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50 }}>
          <div style={{ background: '#1a1613', padding: 24, borderRadius: 12, maxWidth: 480, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            {selected.photo_url && (
              <img src={selected.photo_url} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 14 }} />
            )}
            <h2 style={{ margin: '0 0 6px' }}>{selected.title}</h2>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#c9895f', margin: '0 0 10px' }}>{selected.price_formatted}</p>
            <p style={{ color: '#8a8177', fontSize: 13, margin: '0 0 14px' }}>
              {selected.location} · {timeAgo(selected.posted_at)}
            </p>

            <p style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.5, marginBottom: 14 }}>
              {selected.description}
            </p>

            {selected.reason && (
              <p style={{ fontSize: 12, color: '#8a8177', fontStyle: 'italic', marginBottom: 14 }}>
                Alasan lolos filter: {selected.reason}
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <a
                href={selected.listing_url}
                target="_blank"
                rel="noreferrer"
                style={{ flex: 1, textAlign: 'center', background: '#2a2521', color: '#ece7e0', padding: '10px', borderRadius: 8, textDecoration: 'none' }}
              >
                Buka di Facebook
              </a>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{ flex: 1, textAlign: 'center', background: '#2e7d32', color: '#fff', padding: '10px', borderRadius: 8, textDecoration: 'none' }}
                >
                  Chat WhatsApp
                </a>
              )}
            </div>
            {!waLink && (
              <p style={{ fontSize: 12, color: '#8a8177', marginBottom: 14 }}>
                Nomor HP tidak ditemukan di deskripsi. Hubungi lewat tombol Buka di Facebook.
              </p>
            )}

            <label style={{ fontSize: 12, color: '#8a8177', display: 'block', marginBottom: 6 }}>Catatan pribadi</label>
            <textarea
              value={notesDraft}
              onChange={function (e) { setNotesDraft(e.target.value); }}
              rows={3}
              style={{ width: '100%', background: '#0f0d0b', color: '#ece7e0', border: '1px solid #2a2521', borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveNotes} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#c9895f', color: '#1a1613', fontWeight: 600, cursor: 'pointer' }}>
                Simpan Catatan
              </button>
              <button onClick={function () { setSelected(null); }} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #2a2521', background: 'transparent', color: '#ece7e0', cursor: 'pointer' }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}