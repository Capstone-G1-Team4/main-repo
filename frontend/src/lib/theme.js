/**
 * Centralized Tailwind class strings for the "cyber" design system.
 *
 * These tokens assume the following custom colors are registered in
 * tailwind.config.js under theme.extend.colors.cyber:
 *   bg, panel, border, purple, indigo, cyan, text, muted
 *
 * IMPORTANT: for these tokens to actually take effect, tailwind.config.js's
 * `content` array must include a glob that covers this file (e.g.
 * "./src/**\/*.{js,jsx}"). If it doesn't, Tailwind's JIT scanner never sees
 * these class names and silently omits them from the compiled CSS.
 *
 * Rule of thumb for this file: every string that describes a color,
 * gradient, border color, or text color lives here — never inline in a
 * page/component's className. Pages should only ever add pure layout
 * utilities (flex, grid, gap, padding, max-w, etc.) inline.
 */

// ---- Page / layout shells ----

export const cyberPageShell =
  "min-h-screen bg-cyber-bg font-sans text-cyber-text selection:bg-cyber-purple/30 relative";

export const cyberPanel =
  "rounded-2xl border border-cyber-border bg-cyber-panel/30 backdrop-blur-sm";

export const cyberDivider = "border-b border-cyber-border";

// ---- Navigation ----

export const cyberNavBar =
  "fixed top-0 left-0 right-0 z-40 border-b border-cyber-border bg-cyber-bg/70 backdrop-blur-md";

export const cyberBrandText =
  "font-black text-sm uppercase tracking-widest bg-gradient-to-r from-cyber-purple to-cyber-cyan bg-clip-text text-transparent";

export const cyberNavLink =
  "text-xs font-bold uppercase tracking-wider text-cyber-muted hover:text-cyber-purple transition";

export const cyberNavLoginButton =
  "rounded-xl border border-cyber-border px-4 py-2 text-xs font-bold text-cyber-muted transition hover:bg-cyber-panel hover:text-cyber-text";

// ---- Typography hierarchy ----

export const cyberHeading =
  "text-2xl font-black tracking-tight bg-gradient-to-r from-white via-cyber-text to-cyber-purple bg-clip-text text-transparent sm:text-3xl";

export const cyberHeroHeading =
  "mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-cyber-text";

export const cyberHeroHighlight =
  "text-transparent bg-clip-text bg-gradient-to-r from-cyber-purple via-cyber-indigo to-cyber-cyan";

export const cyberHeroSubtext =
  "mt-4 text-base text-cyber-muted max-w-xl mx-auto leading-relaxed";

export const cyberSectionEyebrow =
  "text-[11px] font-black uppercase tracking-widest text-cyber-purple font-mono";

export const cyberSectionHeading = "text-lg font-black text-cyber-text tracking-tight";

export const cyberSectionSubheading = "text-sm text-cyber-muted leading-relaxed";

export const cyberTextPrimary = "text-cyber-text";

export const cyberTextMuted = "text-cyber-muted";

export const cyberTextBody = "text-base text-cyber-muted leading-relaxed";

export const cyberLinkActive = "text-cyber-purple font-bold transition hover:text-cyber-cyan";

export const cyberLinkInactive = "text-cyber-muted font-bold transition hover:text-cyber-text";

export const cyberLabel =
  "block text-[11px] font-bold text-cyber-muted uppercase tracking-wider font-mono mb-1.5";

// ---- Buttons ----

export const cyberButtonPrimary =
  "rounded-xl bg-gradient-to-r from-cyber-purple to-cyber-indigo py-3.5 px-6 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-cyber-purple/30 transition hover:opacity-90 hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:pointer-events-none";

export const cyberButtonSecondary =
  "rounded-xl bg-cyber-panel border border-cyber-border py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-cyber-muted transition hover:bg-cyber-bg hover:text-cyber-text";

export const cyberButtonGhost =
  "rounded-xl bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20 px-4 py-2 text-xs font-bold hover:bg-cyber-purple hover:text-white transition";

export const cyberButtonOutline =
  "inline-flex items-center gap-2 rounded-xl bg-cyber-panel border border-cyber-purple/30 px-6 py-4 text-sm font-bold text-cyber-purple transition-all duration-200 hover:bg-cyber-purple hover:text-white";

// ---- Badges / eyebrows ----

export const cyberEyebrowBadge =
  "inline-flex items-center gap-1.5 rounded-full bg-cyber-purple/10 px-3.5 py-1 text-xs font-semibold text-cyber-purple border border-cyber-purple/20";

export const cyberEyebrowDot = "h-1.5 w-1.5 rounded-full bg-cyber-purple animate-ping";

export const cyberBadge =
  "bg-cyber-bg/80 px-2 py-0.5 rounded-md border border-cyber-border text-cyber-muted";

export const cyberBadgeBrand =
  "text-[10px] font-black uppercase tracking-widest text-cyber-purple font-mono";

// ---- Hero section ----

export const cyberHeroSection =
  "relative border-b border-cyber-border bg-cyber-panel/40 backdrop-blur-md py-24 px-4 text-center sm:px-6 lg:px-8 shadow-2xl";

export const cyberHeroContainer = "mx-auto max-w-3xl relative z-10";

// ---- Search / filters ----

export const cyberInput =
  "w-full rounded-xl border border-cyber-border bg-cyber-panel/60 backdrop-blur-sm px-4 py-3.5 text-xs text-cyber-text placeholder-cyber-muted focus:border-cyber-purple focus:outline-none focus:ring-1 focus:ring-cyber-purple transition-all";

export const cyberInputIcon = "absolute left-4 top-4 text-cyber-muted text-sm";

export const cyberFilterBar =
  "flex flex-wrap gap-2.5 bg-cyber-panel/40 p-1.5 rounded-2xl border border-cyber-border backdrop-blur-sm";

export const cyberFilterButton =
  "rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-cyber-muted hover:text-cyber-text hover:bg-cyber-panel/40 transition";

export const cyberTabActive =
  "bg-gradient-to-r from-cyber-purple to-cyber-indigo text-white shadow-lg shadow-cyber-purple/20";

export const cyberTabInactive = "text-cyber-muted hover:text-cyber-text hover:bg-cyber-panel/50";

// ---- Cards ----

export const cyberCard =
  "group relative flex flex-col overflow-hidden rounded-2xl border border-cyber-border bg-cyber-panel/30 p-4 transition-all duration-300 hover:border-cyber-purple/30 hover:-translate-y-1";

export const cyberCardImageFrame =
  "relative aspect-square w-full overflow-hidden rounded-xl bg-cyber-bg border border-cyber-border flex items-center justify-center p-4";

export const cyberCardTitle =
  "mt-2 text-sm font-bold text-cyber-text group-hover:text-cyber-purple transition line-clamp-2";

export const cyberCardPrice = "text-lg font-black text-cyber-text";

export const cyberCardFooter =
  "mt-6 pt-4 border-t border-cyber-border flex items-center justify-between";

// ---- Empty state ----

export const cyberEmptyState =
  "text-center py-24 bg-cyber-panel/20 rounded-2xl border border-cyber-border backdrop-blur-sm";

export const cyberEmptyStateText = "text-cyber-muted font-mono text-sm";

// ---- Modals ----

export const cyberModalOverlay =
  "fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-bg/80 backdrop-blur-sm";

// ---- About / informational page building blocks ----

export const cyberPageHero =
  "relative border-b border-cyber-border bg-cyber-panel/40 backdrop-blur-md py-20 px-4 text-center sm:px-6 lg:px-8";

export const cyberStatCard =
  "rounded-2xl border border-cyber-border bg-cyber-panel/30 backdrop-blur-sm p-6 text-center hover:border-cyber-purple/30 transition";

export const cyberStatValue =
  "text-3xl font-black bg-gradient-to-r from-cyber-purple to-cyber-cyan bg-clip-text text-transparent";

export const cyberStatLabel =
  "mt-2 text-[11px] font-bold uppercase tracking-widest text-cyber-muted font-mono";

export const cyberArchitectureNode =
  "rounded-2xl border border-cyber-border bg-cyber-panel/30 backdrop-blur-sm p-6 hover:border-cyber-cyan/40 transition";

export const cyberArchitectureNodeIcon =
  "flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan";

export const cyberArchitectureConnector = "text-cyber-border";

export const cyberTeamCard =
  "group rounded-2xl border border-cyber-border bg-cyber-panel/30 backdrop-blur-sm p-6 text-center transition-all duration-300 hover:border-cyber-purple/30 hover:-translate-y-1";

export const cyberTeamAvatarRing =
  "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyber-purple to-cyber-cyan text-2xl font-black text-white shadow-lg shadow-cyber-purple/30";

export const cyberTeamName = "mt-4 text-sm font-black text-cyber-text";

export const cyberTeamRole =
  "mt-1 text-[11px] font-bold uppercase tracking-wider text-cyber-purple font-mono";

export const cyberTeamBio = "mt-3 text-xs text-cyber-muted leading-relaxed";

// ---- Homepage extension sections (Platform Features, Categories,
// How It Works, AI Technology, Stats, Bottom CTA) ----
// Added as part of the homepage landing-page expansion. Follows the same
// naming convention as the rest of the file: <area><element>.

export const cyberSectionContainer = "mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10";

export const cyberSectionDivider = "border-t border-cyber-border/60";

// Platform Features
export const cyberFeatureCard =
  "group relative flex flex-col gap-3 rounded-2xl border border-cyber-border bg-cyber-panel/30 backdrop-blur-sm p-6 transition-all duration-300 hover:border-cyber-purple/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyber-purple/10";

export const cyberFeatureIcon =
  "flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-purple/10 border border-cyber-purple/20 text-2xl transition-colors group-hover:bg-cyber-purple/20";

export const cyberFeatureTitle = "text-sm font-black text-cyber-text tracking-tight";

export const cyberFeatureText = "text-xs text-cyber-muted leading-relaxed";

// Shop by Category
export const cyberCategoryCard =
  "group relative flex flex-col items-center gap-3 rounded-2xl border border-cyber-border bg-cyber-panel/30 backdrop-blur-sm p-8 text-center transition-all duration-300 hover:border-cyber-cyan/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyber-cyan/10 cursor-pointer";

export const cyberCategoryIcon = "text-4xl transition-transform duration-300 group-hover:scale-110";

export const cyberCategoryName =
  "text-sm font-black uppercase tracking-wider text-cyber-text group-hover:text-cyber-cyan transition";

export const cyberCategoryDescription = "text-xs text-cyber-muted leading-relaxed";

// How It Works (timeline)
export const cyberTimelineStep =
  "relative flex flex-1 flex-col items-center gap-3 rounded-2xl border border-cyber-border bg-cyber-panel/30 backdrop-blur-sm p-6 text-center transition-all duration-300 hover:border-cyber-purple/30 hover:-translate-y-1";

export const cyberTimelineStepNumber =
  "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyber-purple to-cyber-indigo text-sm font-black text-white shadow-lg shadow-cyber-purple/30";

export const cyberTimelineStepIcon = "text-3xl";

export const cyberTimelineStepTitle = "text-sm font-black text-cyber-text tracking-tight";

export const cyberTimelineConnector =
  "hidden sm:flex flex-1 items-center justify-center text-cyber-border text-xl";

// AI Technology
export const cyberTechBadge =
  "inline-flex items-center gap-2 rounded-xl border border-cyber-border bg-cyber-panel/40 px-4 py-2.5 text-xs font-bold text-cyber-muted backdrop-blur-sm transition-all duration-300 hover:border-cyber-purple/40 hover:text-cyber-text hover:-translate-y-0.5";

export const cyberTechBadgeIcon = "text-cyber-purple";

// Platform Statistics (homepage variant, visually distinct wrapper from About)
export const cyberStatsSection =
  "relative overflow-hidden rounded-3xl border border-cyber-border bg-gradient-to-br from-cyber-panel/50 via-cyber-panel/20 to-cyber-bg/40 backdrop-blur-md p-8 sm:p-10";

export const cyberStatsIcon = "text-2xl";

// Bottom CTA
export const cyberCTASection =
  "relative overflow-hidden rounded-3xl border border-cyber-border bg-gradient-to-br from-cyber-purple/10 via-cyber-panel/40 to-cyber-cyan/10 backdrop-blur-md p-12 text-center shadow-2xl";

export const cyberCTAHeading =
  "text-2xl font-black tracking-tight text-cyber-text sm:text-3xl";

export const cyberCTASubtext = "mt-3 text-sm text-cyber-muted max-w-lg mx-auto leading-relaxed";

// ---- Theme toggle (Dark Cyberpunk <-> Light Cyberpunk) ----
// Pairs with src/context/ThemeContext.js. The button itself never
// hardcodes a color per-mode — it uses the same cyber-* tokens as
// everything else, which repaint automatically via CSS variables.

export const cyberThemeToggle =
  "inline-flex items-center gap-2 rounded-xl border border-cyber-border bg-cyber-panel px-3.5 py-2 text-xs font-bold text-cyber-muted transition-all duration-200 hover:border-cyber-purple/40 hover:text-cyber-text";

export const cyberThemeToggleIcon = "text-sm leading-none";

// ---- Order history (Profile dashboard) ----

export const cyberOrderCard =
  "flex flex-col gap-4 rounded-2xl border border-cyber-border bg-cyber-panel/30 backdrop-blur-sm p-5 transition-all duration-300 hover:border-cyber-purple/30";

export const cyberOrderId = "font-mono text-xs font-bold text-cyber-text";

export const cyberOrderTimestamp = "font-mono text-[10px] text-cyber-muted";

export const cyberOrderStatusBadge =
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-wider";

export const cyberOrderItemRow =
  "flex items-center justify-between border-b border-cyber-border/60 py-2 text-xs last:border-b-0";

export const cyberOrderItemName = "text-cyber-text";

export const cyberOrderItemQty = "font-mono text-[10px] text-cyber-muted";

export const cyberOrderTotalRow =
  "mt-1 flex items-center justify-between border-t border-cyber-border pt-4";

export const cyberOrderTotalLabel =
  "text-[11px] font-bold uppercase tracking-wider text-cyber-muted";

export const cyberOrderTotalValue = "text-lg font-black text-cyber-purple";

// ---- Chat history sidebar (Chat page) ----

export const cyberChatTopBar =
  "z-10 flex items-center justify-between border-b border-cyber-border bg-cyber-panel px-6 py-4";

export const cyberChatSidebar =
  "flex w-72 flex-col space-y-4 rounded-2xl border border-cyber-border bg-cyber-panel/40 p-4 backdrop-blur-sm";

export const cyberChatSidebarTitle =
  "font-mono text-xs font-black uppercase tracking-widest text-cyber-text";

export const cyberChatSessionCard =
  "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition duration-200";

export const cyberChatSessionActive =
  "border-cyber-purple bg-cyber-purple/10 text-cyber-text";

export const cyberChatSessionInactive =
  "border-cyber-border/60 bg-cyber-bg/40 text-cyber-muted hover:border-cyber-purple/40 hover:text-cyber-text";

export const cyberChatSessionIcon =
  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-cyber-border bg-cyber-bg/60 text-sm";

export const cyberChatSessionTitle = "truncate text-xs font-bold";

export const cyberChatSessionTimestamp = "mt-1 block font-mono text-[9px] text-cyber-purple/70";

export const cyberChatWindowFrame =
  "h-[650px] flex-1 overflow-hidden rounded-2xl border border-cyber-border bg-cyber-panel shadow-2xl";

export const cyberChatMobileToggle =
  "inline-flex items-center gap-2 rounded-xl border border-cyber-border bg-cyber-panel px-3 py-2 text-xs font-bold text-cyber-muted transition hover:border-cyber-purple/40 hover:text-cyber-text md:hidden";

export const cyberChatDrawerOverlay =
  "fixed inset-0 z-40 bg-cyber-bg/70 backdrop-blur-sm md:hidden";