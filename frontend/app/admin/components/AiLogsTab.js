"use client";

export default function AiLogsTab() {
  const mockAiLogs = [
    { id: "LOG-992", query: "show me headphones", resolvedCategory: "headphones", precision: "High Match", model: "RAG-Agent-V1" },
    { id: "LOG-991", query: "iphone under 800", resolvedCategory: "phones", precision: "Strict Filter", model: "RAG-Agent-V1" },
    { id: "LOG-990", query: "running sneakers", resolvedCategory: "shoes", precision: "Strict Filter", model: "RAG-Agent-V1" }
  ];

  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-900/20 overflow-hidden shadow-xl animate-fadeIn">
      <div className="p-5 border-b border-slate-900 bg-slate-950/40">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">Semantic RAG Grounding Logs Audit</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-900 bg-slate-950 font-mono text-slate-500 font-bold uppercase">
              <th className="p-4">Trace Token</th>
              <th className="p-4">User Prompt </th>
              <th className="p-4">Detected Intent</th>
              <th className="p-4">Match Precision</th>
              <th className="p-4">Active Agent Module</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 font-medium font-mono">
            {mockAiLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-900/20 transition">
                <td className="p-4 text-slate-600">{log.id}</td>
                <td className="p-4 text-slate-200 font-sans font-medium">"{log.query}"</td>
                <td className="p-4 uppercase text-purple-400">{log.resolvedCategory}</td>
                <td className="p-4 text-emerald-400">{log.precision}</td>
                <td className="p-4 text-slate-500">{log.model}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}