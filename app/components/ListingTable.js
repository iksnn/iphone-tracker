'use client';
import { useState, useEffect } from 'react';

export default function ListingTable() {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', location: '' });
  const [selected, setSelected] = useState(null);

  async function loadData() {
    const params = new URLSearchParams(filters);
    const res = await fetch(`/api/listings?${params}`);
    const data = await res.json();
    setListings(data.listings || []);
  }

  useEffect(() => { loadData(); }, []);

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Harga min"
          type="number"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
        />
        <input
          placeholder="Harga max"
          type="number"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
        />
        <input
          placeholder="Lokasi"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <button onClick={loadData}>Terapkan Filter</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Harga</th>
            <th>Lokasi</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {listings.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.price_formatted}</td>
              <td>{item.location}</td>
              <td>
                <button onClick={() => setSelected(item)}>Lihat Detail</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1a1613', padding: 24, borderRadius: 10, maxWidth: 500 }}>
            <img src={selected.photo_url} alt={selected.title} style={{ width: '100%', borderRadius: 8 }} />
            <h2>{selected.title}</h2>
            <p>{selected.price_formatted}</p>
            <p>{selected.location}</p>
            <p>{selected.description}</p>
            <a href={selected.listing_url} target="_blank" rel="noreferrer">Buka di Facebook</a>
            <button onClick={() => setSelected(null)}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}