import RunButton from './components/RunButton';
import ListingTable from './components/ListingTable';

export default function Home() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      <h1>iPhone Garansi Resmi</h1>
      <RunButton />
      <ListingTable />
    </main>
  );
}