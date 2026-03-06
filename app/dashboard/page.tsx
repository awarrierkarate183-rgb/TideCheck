export default function Dashboard() {
  return (
    <main className="min-h-screen p-8" style={{background: "linear-gradient(135deg, #0A2342 0%, #0E6B8A 100%)"}}>
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🌊 TideCheck</h1>
        <p className="text-blue-200">Lake Erie — Cleveland, OH</p>
      </div>

      {/* Risk Badge */}
      <div className="flex justify-center mb-8">
        <div className="bg-red-500 text-white text-2xl font-bold px-8 py-4 rounded-2xl animate-pulse">
          ⚠️ HIGH RISK
        </div>
      </div>

      {/* Animated Water Graphic */}
      <div className="max-w-2xl mx-auto mb-8 rounded-2xl overflow-hidden" style={{height: "200px", background: "linear-gradient(180deg, #1a6b3a 0%, #2d4a1e 100%)"}}>
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-green-200 text-6xl">🦠</p>
          <p className="text-white text-xl ml-4">Algae bloom detected</p>
        </div>
      </div>

      {/* AI Summary Card */}
      <div className="max-w-2xl mx-auto mb-8 bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20">
        <h2 className="text-white text-xl font-bold mb-3">💬 Water Report</h2>
        <p className="text-blue-100 leading-relaxed">
          I am Lake Erie, and right now I am struggling. My nutrient levels are elevated and water temperatures are unusually warm, creating ideal conditions for harmful algal growth. Please avoid swimming near the shoreline until conditions improve.
        </p>
      </div>

      {/* Action Checklist */}
      <div className="max-w-2xl mx-auto mb-8 bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20">
        <h2 className="text-white text-xl font-bold mb-4">✅ What You Can Do This Week</h2>
        <div className="flex flex-col gap-3">
          {["Avoid using fertilizer within 50 feet of any drain", "Pick up pet waste before the next rain", "Report any green water to your local EPA", "Plant native buffer plants near your shoreline", "Avoid swimming near the shoreline"].map((action, i) => (
            <label key={i} className="flex items-center gap-3 text-blue-100 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded" />
              {action}
            </label>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <a href="/" className="text-blue-200 border border-blue-300 border-opacity-40 px-6 py-2 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
          ← Check Another ZIP
        </a>
      </div>

    </main>
  );
}