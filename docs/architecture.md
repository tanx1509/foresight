# System Architecture

## Overview
FORESIGHT MVP uses a strictly local, monorepo architecture designed for a deterministic, high-quality demonstration of the product's vision without relying on external cloud endpoints.

## Components

### 1. Frontend (`frontend/`)
- **Technology:** Next.js 15, React 19, Tailwind CSS.
- **Responsibility:** Renders the Microsoft Teams-inspired UI, orchestrates the simulation timeline visually, and presents the final `FailureSimulation` data cleanly to the user.

### 2. Backend (`backend/`)
- **Technology:** Node.js, Express, TypeScript.
- **Responsibility:** Hosts the simulated multi-agent system and tracks `DecisionRecords` locally via a JSON file.
- **Agents:**
  - `SIGNAL`: Parses the decision payload.
  - `HISTORIAN`: Retrieves relevant mock documents.
  - `AUDITOR`: Compiles local constraints.
  - `CHALLENGER`: Generates critical assumptions based on evidence.
  - `SYNTHESIZER`: Aggregates outputs into the final failure scenarios.

### 3. Shared Library (`shared/`)
- **Technology:** TypeScript.
- **Responsibility:** Enforces type safety across the monorepo by exposing the core domain models (`DecisionContext`, `Document`, `FailureSimulation`, etc.).

### 4. Mock Data (`mock-data/`)
- **Technology:** TypeScript/JSON.
- **Responsibility:** Contains the 40 hardcoded but highly realistic organizational documents and operational metrics to prove the simulation concept.
