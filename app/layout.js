export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: 'linear-gradient(to bottom, #0A2342, #0E6B8A)' }}>
        <nav style={{ padding: '10px', background: '#0E6B8A', color: 'white' }}>
          <a href="/home" style={{ marginRight: '15px', color: 'white' }}>Home</a>
          <a href="/dashboard" style={{ marginRight: '15px', color: 'white' }}>Dashboard</a>
          <a href="/game" style={{ color: 'white' }}>Mini-Game</a>
        </nav>
        {children}
      </body>
    </html>
  );
}