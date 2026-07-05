# Capstone Team Contract

**Team slug:** Capstone-G1-Team4
**Team name:** Team 4
**Date completed:** 2026-07-05

---

## 1. Team Roster

| Name | GitHub handle | Preferred contact hours (with timezone) | Best pronounceable phonetic (for Demo Day intro) |
|---|---|---|---|
| Shahd Ala' Ghunimah | ShahdGunimah7 | 10:00 AM – 8:00 PM (Amman, GMT+3) | "Shahd" (rhymes with "rod") |
| Naseem Saleh Migdadi | naseemmig02 | 10:00 AM – 8:00 PM (Amman, GMT+3) | "Na-SEEM" |
| Dania Mohummad Jarbooh | DaniaJarbou | 10:00 AM – 8:00 PM (Amman, GMT+3) | "DAH-nya" |
| Mousa Al-Rashdan | m3alrashdan | 10:00 AM – 8:00 PM (Amman, GMT+3) | "MOO-sa" |

---

## 2. Cooperation Plan

### 2.1 Each teammate's key strengths
- **Shahd (AI):** model design and prompt engineering, evaluation methodology, translating results into plain-language findings.
- **Naseem (Infrastructure):** CI/CD and deployment, Git/branch-protection setup, environment and dependency management.
- **Dania (Front End):** UI/UX design, React implementation, turning feature requirements into a working interface.
- **Mousa (Back End):** API design, database/data-flow architecture, server-side logic and integration.

### 2.2 How the team will use those strengths
Shahd takes point on model scoping, dataset/evaluation work, and the technical parts of the executive briefing. Naseem owns deployment, CI/CD, and the Git/Project-board setup described in Section 6. Dania leads the front-end build and demo polish, and Mousa leads the back-end/API layer that connects the model to the interface. Documentation and the executive briefing are a shared responsibility, coordinated at the 8:00 PM sync so no single person is stuck writing it alone.

### 2.3 What each teammate wants to develop
Shahd: designing a conversational agent that does more than answer questions — one that can hold an order-placement dialogue end-to-end (product lookup via RAG, confirming the order, asking for delivery details) and knows when to call a tool/function versus just respond in text.
Naseem: integrating and deploying a third-party API (Google Maps link parsing/geocoding) as part of the pipeline, and leading the technical discussion on how that service fits into the Docker/Compose setup.
Dania: designing a conversational UI (chat-style ordering flow) rather than a static dashboard, and giving critical feedback kindly during PR reviews.
Mousa: building the order-processing and location-handling logic on the backend — turning a raw Google Maps link into a precise, usable delivery location — and reading production code fluently across the whole stack.

### 2.4 Day-to-day work approach
- Daily sync: every day at 8:00 PM (Amman) on the Team4 Slack channel / Google Meet, kept short and focused (status + blockers).
- Shared tracking view: Jira (agile board) for sprint/task planning, plus a GitHub Project board mirroring the same tasks so work is visible directly against the repo.
- Every teammate owns a functional area (AI / Front End / Infrastructure / Back End) end-to-end for their tasks, so no one is stuck only doing small leftover pieces; cross-area pairing (Section 5.2) keeps anyone from being boxed in.

---

## 3. Conflict Plan

### 3.1 Process for resolving disagreement
When a disagreement comes up — technical or otherwise — the team names the specific point of disagreement out loud in the daily sync or a dedicated Slack thread rather than letting it linger. Each teammate states their view and reasoning without interruption. The team then looks for a consensus decision; if consensus isn't reached within one sync cycle, the team agrees on a compromise every teammate can live with and moves forward, revisiting later if needed.

### 3.2 If one teammate is dominating or steamrolling
- First step: a teammate names it directly but respectfully in the moment or right after ("let's make sure we hear from everyone on this before deciding").
- Escalation if that doesn't work: a private, direct conversation outside the group sync; if the pattern continues, the team raises it together and, if still unresolved, escalates per Section 3.5.

### 3.3 If one teammate is under-contributing or missing check-ins
- First step: a private, respectful, direct message asking what's going on and whether they need support or a lighter/different task.
- Escalation if that doesn't work: the team raises it together at the next sync to reset expectations, and if it persists, escalates per Section 3.5.

### 3.4 Handling mismatched skill levels
More-experienced teammates coach by pairing and explaining reasoning rather than taking over the keyboard or pushing direct fixes to someone else's branch. Less-experienced teammates are expected to ask for help in the Team4 Slack channel as soon as they're stuck for more than ~30–45 minutes, rather than silently struggling alone until the next sync.

### 3.5 Escalation path
If the team cannot resolve a conflict internally, send a Slack message to the Leadership Team.

**Confirm every teammate agrees to this escalation path:** Yes — Shahd, Naseem, Dania, and Mousa all agree.

---

## 4. Communication Plan

### 4.1 Availability
- **Shahd:** 10:00 AM – 8:00 PM (Amman)
- **Naseem:** 10:00 AM – 8:00 PM (Amman)
- **Dania:** 10:00 AM – 8:00 PM (Amman)
- **Mousa:** 10:00 AM – 8:00 PM (Amman)

**Team daily sync time:** 8:00 PM (Amman) on Google Meet / Team4 Slack channel.

### 4.2 Platforms
- Async text: Slack channel "Team4"
- Live meetings: Google Meet
- Code review: GitHub PRs on the team repo
- Shared docs: Google Drive

### 4.3 After-hours + weekend expectations
No work is expected on weekends. Async Slack messages can be sent any time during the week, but the expected response window is the next working-hours block (10:00 AM–8:00 PM), not immediately. Nobody is expected to work overnight or through the weekend rest period.

### 4.4 If a teammate falls behind
The teammate whose area is closest to the blocked work pairs with the person who's behind so they can learn the material and still contribute meaningfully, rather than having their part quietly redone by someone else. The team also re-checks at the next 8:00 PM sync whether the task needs to be re-scoped or split.

### 4.5 Ensuring every voice is heard
For all four teammates, a "safe" environment means: disagreements are addressed directly to the point being made (not the person), everyone gets a chance to speak before a decision is made at sync, and falling behind can be said out loud without it being treated as a failure — the team's job at that point is to help, not to judge.

---

## 5. Work Plan

### 5.1 Task identification, assignment, tracking
- Tasks are broken down by functional area (AI / Front End / Infrastructure / Back End) and refined at the daily 8:00 PM sync as the sprint progresses.
- Tracking tool: GitHub Projects (mirrored from the team's Jira board), one card per task with an assignee.
- Definition of done: PR merged to `main`, with a brief demo at the next sync.

### 5.2 Anti-siloing note
- Every teammate pairs or shadows at least once during the sprint on a task outside their primary strength area — e.g., Dania shadows Naseem on a deployment task, Mousa shadows Shahd on an evaluation task — so everyone can explain the whole system by Demo Day.
- Every PR needs at least one teammate review before merging to main.

**Confirm the team agrees:** Yes — the team agrees.

### 5.3 No-solo-committing rule
Working alone on the project during non-working hours or over the weekend without a clear task assignment is not acceptable. Solo scratch work stays on a scratch branch that never merges to main.

**Confirm the team agrees:** Yes — the team agrees.

---

## 6. Git Process

### 6.1 Team GitHub org, repo, and Project board
- Team GitHub org URL: https://github.com/Capstone-G1-Team4
- Team repo URL: https://github.com/Capstone-G1-Team4/main-repo
- GitHub Project board URL: https://github.com/orgs/Capstone-G1-Team4/projects/1
- Every teammate is an org Owner: confirmed
- Technical Team (Lead Instructor + TAs) invited as Members with Write access: confirmed

### 6.2 Branch strategy
- `main`: production-ready. All PRs land here after review.
- `dev`: skipped — the team goes directly from feature branches to `main` to keep the flow simple for a 4-person team.
- Feature branches: `feature/<slug>` or `<teammate-github>/<slug>`, one task per branch (e.g. `feature/ai-eval-harness`, `feature/frontend-dashboard`). Branches are deleted after merge.

### 6.3 PR review workflow
- Every PR to `main` requires **2** teammate approvals before merging (branch protection enforced). Agreed by the team.
- PR author never merges their own PR.
- Stale-approval dismissal is on — new commits reset approvals.
- PR title format: `<slug>: <short imperative summary>`
- PR body includes: (a) what changed, (b) any teammate action needed, (c) test evidence.
- PRs auto-link to the Project board (opened → In review; merged → Done).
- No unilateral bypass of branch protection. Any emergency exception is requested via the course Slack channel and authorized by the Lead Instructor, then restored immediately after.

### 6.4 Merge cadence
The team merges to `main` daily during the 8:00 PM sync, plus on-demand whenever a PR is unblocking someone else's work. A teammate marks their PR ready by posting in the Team4 Slack channel and tagging a reviewer directly, rather than waiting silently for someone to notice.

### 6.5 GitHub Project board — how the team runs it
- Columns: Backlog / In progress / In review / Done.
- Every task is a card with an owner. No unassigned cards in In progress.
- Automations: PR opened → In review; PR merged → Done.
- Board update rhythm: a card sitting in In progress for more than 24 hours without a note gets raised at the next standup.
- Daily standup: 8:00 PM (Amman) on Google Meet. Yesterday / today / blockers. 15 minutes max.

### 6.6 Post-cohort plan for the GitHub org
- Primary contact after graduation: Naseem (owns infra/org setup).
- Keep org active for portfolio purposes? Yes, indefinitely, unless the team later agrees otherwise.
- Allow personal forks of main-repo for individual portfolios? Yes.
- Notice period before deleting the org: 30 days' notice to every teammate, with a chance to fork first.
- License on main-repo: MIT (default) — committed before the technical-work freeze.

---

## 7. Presentation Practice

*(Happens during Build Week 2 as the system stabilizes and the deck comes together.)*

- Narrative lead on Demo Day: Shahd — she's closest to the model/results story that anchors the pitch.
- Live demo runner: Mousa and Dania jointly, since together they own the working end-to-end system (back end + front end).
- Backup presenter/demo-runner: Naseem, who can step in for either the narrative or the demo if someone is unavailable.
- Practice-run cadence: a dry run at each Progress Check appointment (Thu 9 / Sun 12 Jul), plus at least one full run-through in the days immediately before Demo Day.

---

## 8. Sign-off

Every teammate reviews the completed contract and signs by adding their GitHub handle below.

- Naseem Saleh Migdadi (@naseemmig02) — reviewed and agrees.
- Shahd Ala' Ghunimah (@ShahdGunimah7) — reviewed and agrees.
- Mousa Al-Rashdan (@m3alrashdan) — reviewed and agrees.
- Dania Mohummad Jarbooh (@DaniaJarbou) — reviewed and agrees.

**Date completed:** 2026-07-05

---

## 9. Mid-Sprint Revisit

Bring this contract to the Progress Check Zoom appointment (Thu 9 or Sun 12 Jul). Skim it together. If anything is not working — communication cadence, workload balance, git flow — say so, and update the contract with agreed changes. Committing an amended `TEAM_CONTRACT.md` mid-sprint is not a failure; it's exactly how a team contract earns its keep.

**Mid-sprint updates log:**
| Date | What changed | Why |
|---|---|---|
| … | … | … |