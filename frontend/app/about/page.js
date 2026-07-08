"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  // Official Team 4 Roster from Capstone Proposal Schema
  const teamMembers = [
    {
      name: "Dania Jarbooh",
      role: "Front End & UI/UX Specialist",
      bio: "Engineers responsive Next.js/React application scopes, UI components, and fluid chat viewport pipelines.",
      avatar: "👩‍💻"
    },
    {
      name: "Shahd Ghunimah",
      role: "AI Engineer & Prompt Architect",
      bio: "Manages foundational model design, advanced prompt engineering, and core evaluation methodology tracking.",
      avatar: "🧠"
    },
    {
      name: "Mousa Al-Rashdan",
      role: "Back End & Data Systems Architect",
      bio: "Constructs server APIs, structures product dataset schemas, and optimizes vector index storage clusters.",
      avatar: "👨‍💻"
    },
    {
      name: "Naseem Migdadi",
      role: "Infrastructure & DevOps Engineer",
      bio: "Controls automated CI/CD branch protection pipelines, Docker Compose orchestration layers, and deployment environments.",
      avatar: "🛠️"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-cyber-bg font-sans text-cyber-text selection:bg-cyber-purple/30 relative pt-20">
      
      {/* FUTURISTIC GLOBAL NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-cyber-panel bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
              <span className="text-xl">🔮</span>
              <span className="font-black text-sm uppercase tracking-widest bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                NextGen Core
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/" className="text-xs font-bold uppercase tracking-wider text-cyber-muted hover:text-cyber-purple transition">⬅️ Back to Home</Link>
              <Link href="/products" className="text-xs font-bold uppercase tracking-wider text-cyber-muted hover:text-cyber-purple transition">🛍️ Explore Products</Link>
              <Link href="/chat" className="text-xs font-bold uppercase tracking-wider text-cyber-muted hover:text-cyber-cyan transition">💬 AI Chat Agent</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container Workspace */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Project Vision Headline Block */}
        <div className="text-center space-y-4 animate-fadeIn">
         
          <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyber-purple">
            NextGen AI Shopping Assistant
          </h1>
          <p className="text-sm text-cyber-muted max-w-3xl mx-auto leading-relaxed">
            E-commerce businesses frequently lose conversions to slow product discovery and frictional checkouts. 
            Our platform solves this challenge with an intelligent **Conversational Agent powered by Retrieval-Augmented Generation (RAG)**. 
            Customers describe their preferences in natural text, receive personalized choices verified directly against real catalog data pools, and process checkout steps automatically in a single multi-turn chat interaction.
          </p>
        </div>

        {/* Technical Architecture Metric Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-cyber-panel p-6 rounded-2xl space-y-2 shadow-xl backdrop-blur-sm">
            <div className="text-2xl">🧬</div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Grounded RAG</h3>
            <p className="text-[11px] text-cyber-muted leading-relaxed">
              LangChain orchestration linked to dense embedding stores ensures contextual product search results completely free of generative hallucinations.
            </p>
          </div>
          <div className="bg-slate-900/40 border border-cyber-panel p-6 rounded-2xl space-y-2 shadow-xl backdrop-blur-sm">
            <div className="text-2xl">🗺️</div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Geocoding Tools</h3>
            <p className="text-[11px] text-cyber-muted leading-relaxed">
              Accepts Google Maps tracking link arrays directly via chat tokens to accurately decode delivery addresses into structured data formats.
            </p>
          </div>
          <div className="bg-slate-900/40 border border-cyber-panel p-6 rounded-2xl space-y-2 shadow-xl backdrop-blur-sm">
            <div className="text-2xl">📊</div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Target SLAs</h3>
            <p className="text-[11px] text-cyber-muted leading-relaxed">
              Engineered to maintain strict retrieval success rates above 85% with conversational turnaround response latencies bounded under 4 seconds.
            </p>
          </div>
        </div>

        {/* Development Team Roster Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-black uppercase font-mono tracking-widest bg-gradient-to-r from-cyber-purple to-cyber-cyan bg-clip-text text-transparent">
              Development Team Core
            </h2>
            <p className="text-xs text-cyber-muted mt-1">AI.SPIRE Capstone Group 1 Engineers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className="bg-slate-900/20 border border-cyber-panel p-5 rounded-2xl flex flex-col items-center text-center space-y-4 transition-all duration-300 hover:border-cyber-purple/30 hover:bg-slate-900/50 group relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-purple to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="w-14 h-14 rounded-full bg-slate-950 border border-cyber-border flex items-center justify-center text-2xl shadow-inner select-none">
                  {member.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{member.name}</h4>
                  <p className="text-[9px] font-mono text-cyber-purple mt-1 uppercase tracking-widest font-black leading-tight min-h-[20px]">{member.role}</p>
                </div>
                <p className="text-[11px] text-cyber-muted leading-relaxed pt-1 flex-1">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}