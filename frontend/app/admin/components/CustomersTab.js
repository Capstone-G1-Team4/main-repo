"use client";

export default function CustomersTab() {
  const mockCustomers = [
    { id: "USR-01", name: "Dania Jarbooh", email: "dania@example.com", status: "Active Node", country: "Jordan" },
    { id: "USR-02", name: "Shahd Ghunimah", email: "shahd@example.com", status: "Active Node", country: "Jordan" },
    { id: "USR-03", name: "Mousa ALrashdan", email: "mousa@example.com", status: "Suspended Buffer", country: "Jordan" }
  ];

  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-900/20 overflow-hidden shadow-xl animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-900 bg-slate-950 font-mono text-slate-500 font-bold uppercase">
              <th className="p-4"> ID</th>
              <th className="p-4">Full Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">country</th>
              <th className="p-4"> Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 font-medium">
            {mockCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-900/20 transition">
                <td className="p-4 font-mono text-slate-500">{c.id}</td>
                <td className="p-4 font-bold text-slate-200">{c.name}</td>
                <td className="p-4 font-mono text-slate-400">{c.email}</td>
                <td className="p-4 text-slate-400">{c.country}</td>
                <td className="p-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${c.status.includes("Active") ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}