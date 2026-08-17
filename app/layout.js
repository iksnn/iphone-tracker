export const metadata = {
  title: 'iPhone Resmi Tracker',
  description: 'Listing iPhone garansi resmi dari Facebook Marketplace, disaring otomatis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, background: '#0f0d0b', color: '#ece7e0', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
