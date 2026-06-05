# Agent Pet / Living AI Agents Simulation

A public prototype for a browser-based simulation where AI agents behave like believable people inside a small virtual world.

## Core idea

This project explores a game/simulation where each agent has:

- Identity: name, role, personality, relationships.
- Needs: energy, hunger, social, mood, purpose.
- Memory: short-term events and long-term impressions.
- Planning: agents decide what to do next based on needs, goals, relationships, and world events.
- Social behavior: agents can talk, help, avoid, collaborate, argue, reconcile, or form groups.
- World loop: time passes, agents act, the town changes, and stories emerge.

The project now has a pluggable AI brain architecture from the start. The browser prototype uses a safe mock LLM client and a local heuristic brain, while the code is structured so a real backend LLM adapter can be added later without rewriting the simulation.

## MVP goals

1. Simulate 5-8 agents in a small town.
2. Give every agent needs, mood, memory, relationships, and daily goals.
3. Run a turn-based world loop.
4. Display agent thoughts, actions, memories, and dialogue.
5. Support multiple brain modes: local heuristic brain, mock LLM brain, and future backend LLM brain.

## Architecture

```txt
UI Layer
- Town view
- Agent cards
- Event log
- Memory panel
- Private thought panel
- Brain mode selector

Simulation Core
- World state
- Agent state
- Needs system
- Relationship graph
- Memory system
- Action executor

AI Agent Layer
- AgentBrain interface
- AgentObservation object
- AgentThought object
- Local brain implementation
- LLM brain adapter
- Mock LLM client for frontend testing
- Future backend LLM client

Persistence Layer
- LocalStorage for prototype
- Database later
```

## Planned agent loop

```txt
Observe world
  -> Build AgentObservation
  -> Send observation to AgentBrain
  -> Generate private thought
  -> Choose decision
  -> Apply decision to world
  -> Store memory
  -> Render event, dialogue, and thought
```

## Current brain modes

### Local Heuristic Brain

A deterministic planner that chooses actions based on the weakest need, current role, nearby agents, and recent state.

### Mock LLM Brain

A fake LLM client that follows the same adapter shape as a real model. This lets the game loop, JSON parsing, UI, and thought display be tested safely without exposing an API key in the browser.

### Future Real LLM Brain

The real LLM should be called from a backend service, not directly from the frontend. The backend can safely store provider keys and expose a controlled endpoint such as:

```txt
POST /api/agent/decide
```

## Example themes

- AI village / virtual town
- Indie studio simulation
- WW2 commander simulation
- School or classroom social simulation
- Colony management with believable agents

## Development

```bash
npm install
npm run dev
```

## Status

Prototype scaffold with an agent-native architecture, mock LLM brain, local brain, private thoughts, dialogue, memory, relationships, and a turn-based world loop.
