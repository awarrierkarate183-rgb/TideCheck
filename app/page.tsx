export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center" style={{background: "linear-gradient(135deg, #0A2342 0%, #0E6B8A 100%)"}}>
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-white mb-4">🌊 TideCheck</h1>
        <p className="text-xl text-blue-200">Know your water. Protect your world.</p>
      </div>

      {/* ZIP Input Card */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-white border-opacity-20">
        <h2 className="text-white text-2xl font-semibold mb-2 text-center">Check Your Local Water</h2>
        <p className="text-blue-200 text-center mb-6">Enter your ZIP code to see algal bloom risk near you</p>
        
        <input
          type="text"
          placeholder="Enter ZIP code..."
          className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 text-white placeholder-blue-300 border border-white border-opacity-30 focus:outline-none focus:border-white mb-4 text-center text-lg"
        />
        
        <button className="w-full py-3 rounded-xl font-semibold text-white text-lg transition-all" style={{background: "linear-gradient(90deg, #0E6B8A, #2ECC71)"}}>
          Find My Water 🔍
        </button>

        <button className="w-full py-2 mt-3 rounded-xl text-blue-200 border border-blue-300 border-opacity-40 hover:bg-white hover:bg-opacity-10 transition-all">
          Try Demo Location
        </button>
      </div>

      {/* Floating bubbles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white opacity-5 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

    </main>
  );
}