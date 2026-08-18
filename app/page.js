import RunButton from './components/RunButton';
import ListingTable from './components/ListingTable';

export default function Home() {
  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Pemantauan Pasar</p>
          <h1>iPhone Garansi Resmi</h1>
        </div>
        <RunButton />
      </header>
      <ListingTable />
    </main>
  );
}