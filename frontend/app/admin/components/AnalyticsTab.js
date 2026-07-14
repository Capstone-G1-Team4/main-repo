"use client";

export default function AnalyticsTab() {
  const metrics = {
    totalRevenue: 145820.00,
    activeUsers: 1408,
    aiQueriesProcessed: 8932,
    ragPrecisionRate: "99.4%"
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Aggregate Total Revenue", value: `$${metrics.totalRevenue.toLocaleString()}`, accent: "text-purple-400" },
          { title: "Active Customer ", value: metrics.activeUsers, accent: "text-cyan-400" },
          { title: "AI Conversations Handled", value: metrics.aiQueriesProcessed, accent: "text-indigo-400" },
          { title: "Strict RAG Precision Rate", value: metrics.ragPrecisionRate, accent: "text-emerald-400" }
        ].map((card, i) => (
          <div key={i} className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm shadow-xl">
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{card.title}</p>
            <p className={`mt-2 text-2xl font-black ${card.accent} font-mono tracking-tight`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-8 backdrop-blur-sm text-center py-16">
        <span className="text-xl">📈</span>
        <h3 className="mt-2 text-sm font-bold text-slate-300">Live Traffic Mapping Sequence Active</h3>
        
      </div>
    </div>
  );
}