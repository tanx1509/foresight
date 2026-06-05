# FORESIGHT (Phase 0 Hackathon MVP)

FORESIGHT is a Microsoft Teams-inspired decision intelligence platform that predicts how major decisions may fail before they are executed. It simulates failures using organizational memory and operational context via a local multi-agent system.

## Setup Instructions (Under 5 Minutes)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run the Application
Start both the backend API and Next.js frontend concurrently from the root:
```bash
npm run dev
```

### 3. Access the Product
Open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

*(The backend runs automatically on port 3001).*

## How to Demo
1. You will see a simulated Microsoft Teams channel where engineering leadership is discussing a "July 15 SSO Migration".
2. Click **"Run FORESIGHT Analysis"** in the chat area.
3. Watch the 5 AI agents (SIGNAL, HISTORIAN, AUDITOR, CHALLENGER, SYNTHESIZER) process the decision context in real-time.
4. Review the generated **Failure Simulation Dashboard**, analyzing critical scenarios, causal chains, and organizational memory (mock documents).
5. Record a final decision (Delay, Request Review, Proceed). The decision is logged locally by the backend.

## Architecture
- **Monorepo Structure (npm workspaces):**
  - `frontend/`: Next.js 15, Tailwind CSS, App Router. Simulates the Teams interface.
  - `backend/`: Node.js Express server housing the deterministic simulation logic.
  - `shared/`: Shared TypeScript types across frontend and backend.
  - `mock-data/`: 40 statically generated documents and constraints.
- **Data Execution:** 100% local. The agents simulate AI reasoning deterministically for robust demo performance under hackathon constraints. No external API keys required.
