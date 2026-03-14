export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif' }}>
        <nav style={{
          padding: '14px 24px',
          background: 'rgba(10, 35, 66, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', marginRight: '16px' }}>🌿 BloomWatch</span>
          <a href="/home" style={{ color: '#90CAF9', textDecoration: 'none', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid rgba(144,202,249,0.3)' }}>Home</a>
          <a href="/dashboard" style={{ color: '#90CAF9', textDecoration: 'none', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid rgba(144,202,249,0.3)' }}>Dashboard</a>
          <a href="/game" style={{ color: '#2ECC71', textDecoration: 'none', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid rgba(46,204,113,0.4)', background: 'rgba(46,204,113,0.1)' }}>🎮 Game</a>
        </nav>
        {children}
      </body>
    </html>
  );
}