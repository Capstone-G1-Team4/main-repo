"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  cyberPageShell,
  cyberNavBar,
  cyberBrandText,
  cyberNavLink,
  cyberNavLoginButton,
  cyberPageHero,
  cyberEyebrowBadge,
  cyberEyebrowDot,
  cyberHeroHeading,
  cyberHeroHighlight,
  cyberHeroSubtext,
  cyberSectionEyebrow,
  cyberSectionHeading,
  cyberSectionSubheading,
  cyberStatCard,
  cyberStatValue,
  cyberStatLabel,
  cyberArchitectureNode,
  cyberArchitectureNodeIcon,
  cyberArchitectureConnector,
  cyberTeamCard,
  cyberTeamAvatarRing,
  cyberTeamName,
  cyberTeamRole,
  cyberTeamBio,
  cyberButtonPrimary,
  cyberButtonOutline,
} from "../../src/lib/theme";

const PROJECT_STATS = [
  { value: "2,525+", label: "Indexed Catalog Items" },
  { value: "6", label: "Product Categories" },
  { value: "RAG", label: "Retrieval Architecture" },
  { value: "24/7", label: "AI Assistant Uptime" },
];

const ARCHITECTURE_LAYERS = [
  {
    icon: "⚡",
    title: "FastAPI Service Layer",
    description:
      "A Python-based FastAPI backend exposes the chat, product, and cart endpoints consumed by this Next.js frontend.",
  },
  {
    icon: "🧠",
    title: "Agentic RAG Pipeline",
    description:
      "Incoming shopping questions are routed through a retrieval-augmented pipeline that grounds model responses in the real product catalog.",
  },
  {
    icon: "🗂️",
    title: "Vector Database",
    description:
      "Product descriptions and specs are embedded and stored in a vector index, enabling fast semantic search over the catalog.",
  },
  {
    icon: "🐳",
    title: "Docker-Orchestrated Deployment",
    description:
      "Every service — API, vector store, and processing jobs — runs as a containerized unit for consistent local and production environments.",
  },
];

const TEAM_MEMBERS = [
  {
    name: "Dania Jarbooh",
    role: "Front End — UI/UX & React Implementation (AI Engineering Trainee)",
    bio: "Builds the Next.js/React application, owns the design system and UI components, and contributes to AI engineering as a trainee.",
    avatar: "👩‍💻",
  },
  {
    name: "Shahd Ala' Ghunimah",
    role: "AI — Model Design, Prompt Engineering & Evaluation",
    bio: "Designs the underlying model behavior, engineers prompts for the assistant, and builds out the evaluation methodology.",
    avatar: "🧠",
  },
  {
    name: "Naseem Saleh Migdadi",
    role: "Infrastructure — CI/CD, Deployment & Environment Management",
    bio: "Owns CI/CD pipelines, deployment automation, and keeps environments and dependencies consistent across the stack.",
    avatar: "🛠️",
  },
  {
    name: "Mousa Al-Rashdan",
    role: "Back End — API Design & Database/Data-Flow Architecture",
    bio: "Designs the backend APIs and the data-flow architecture connecting the catalog, database, and vector store.",
    avatar: "🗄️",
  },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className={`${cyberPageShell} pt-20`}>
      <nav className={cyberNavBar}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🔮</span>
              <span className={cyberBrandText}>NextGen Core</span>
            </Link>

            <div className="flex items-center gap-5">
              <Link href="/" className={cyberNavLink}>⬅️ Back to Home</Link>
              <Link href="/products" className={cyberNavLink}>🛍️ Explore Products</Link>
              <Link href="/chat" className={cyberNavLink}>💬 AI Chat Agent</Link>
              <Link href="/login" className={cyberNavLoginButton}>
                Login 🔑
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className={cyberPageHero}>
        <div className="mx-auto max-w-3xl relative z-10">
          <span className={cyberEyebrowBadge}>
            <span className={cyberEyebrowDot} />
            Capstone Project — Agentic RAG Commerce
          </span>

          <h1 className={cyberHeroHeading}>
            About the{" "}
            <span className={cyberHeroHighlight}>NextGen Core</span> Team
          </h1>

          <p className={cyberHeroSubtext}>
            We're building an AI-powered shopping assistant that grounds every recommendation in
            a real, retrievable product catalog — not guesswork.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 space-y-20">
        {/* Project stats */}
        <section>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {PROJECT_STATS.map((stat) => (
              <div key={stat.label} className={cyberStatCard}>
                <div className={cyberStatValue}>{stat.value}</div>
                <div className={cyberStatLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section>
          <div className="mb-10 text-center">
            <p className={cyberSectionEyebrow}>System Design</p>
            <h2 className={`${cyberSectionHeading} mt-2 text-2xl`}>NLP &amp; RAG Architecture</h2>
            <p className={`${cyberSectionSubheading} mx-auto mt-3 max-w-2xl`}>
              Every layer of the stack is purpose-built to keep the AI assistant's answers
              accurate, fast, and traceable back to real catalog data — powered by FastAPI,
              Python, Docker, and a dedicated vector database.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {ARCHITECTURE_LAYERS.map((layer, index) => (
              <div key={layer.title} className={cyberArchitectureNode}>
                <div className="flex items-start gap-4">
                  <div className={cyberArchitectureNodeIcon}>
                    <span className="text-lg">{layer.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-cyber-text tracking-tight">
                      {layer.title}
                    </h3>
                    <p className="mt-2 text-xs text-cyber-muted leading-relaxed">
                      {layer.description}
                    </p>
                  </div>
                </div>
                {index < ARCHITECTURE_LAYERS.length - 1 && (
                  <div className={`mt-4 text-right text-xs ${cyberArchitectureConnector}`}>↓</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Meet the Architects */}
        <section>
          <div className="mb-10 text-center">
            <p className={cyberSectionEyebrow}>The People Behind It</p>
            <h2 className={`${cyberSectionHeading} mt-2 text-2xl`}>Meet the Architects</h2>
            
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className={cyberTeamCard}>
                <div className={cyberTeamAvatarRing}>{member.avatar}</div>
                <h3 className={cyberTeamName}>{member.name}</h3>
                <p className={cyberTeamRole}>{member.role}</p>
                <p className={cyberTeamBio}>{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-4">
            <Link href="/chat" className={cyberButtonPrimary}>
              💬 Try the AI Assistant
            </Link>
            <Link href="/products" className={cyberButtonOutline}>
              🛍️ Browse the Catalog
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}