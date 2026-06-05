# User Flow

1. **Initial State (The Workspace)**
   - The user loads the application at `localhost:3000`.
   - They see a Microsoft Teams-style channel interface.
   - A simulated discussion is active between "Sarah Chen" and "Marcus Webb" proposing to proceed with the July 15 SSO Migration.

2. **Triggering FORESIGHT**
   - The user identifies that a critical decision is about to be made.
   - The user clicks the prominent **Run FORESIGHT Analysis** button injected into the chat context.

3. **Agent Simulation**
   - The UI transitions, displaying the **Agent Timeline**.
   - The user visually observes the 5 agents sequentially executing their tasks, simulating the AI reasoning process over 10 seconds.
   - Concurrently, the backend processes the simulation deterministically to ensure a perfect demo.

4. **Reviewing the Dashboard**
   - Upon agent completion, the **Failure Simulation Dashboard** reveals itself.
   - The user explores:
     - 3 Predicted Failure Scenarios (e.g., Legacy Auth failure).
     - Retrieved organizational memory (e.g., past outage postmortems).
     - Live operational constraints.

5. **Decision Engine**
   - The user utilizes the provided information to make an informed choice.
   - They click one of the decision buttons at the bottom: **Delay**, **Request Review**, or **Proceed**.
   - The backend records the decision payload to disk.
