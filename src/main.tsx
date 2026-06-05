import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { stepWorld } from './simulation/engine';
import { createInitialWorld } from './simulation/seed';
import type { AgentNeeds, AgentProfile } from './simulation/types';
import './styles.css';

function NeedBar({ label, value }: { label: keyof AgentNeeds; value: number }) {
  return (
    <div className="need-row">
      <span>{label}</span>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${value}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function AgentCard({ agent, selected, onSelect }: { agent: AgentProfile; selected: boolean; onSelect: () => void }) {
  const lowestNeed = useMemo(() => {
    return Object.entries(agent.needs).sort((a, b) => a[1] - b[1])[0][0];
  }, [agent.needs]);

  return (
    <button className={`agent-card ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="agent-header">
        <div>
          <h3>{agent.name}</h3>
          <p>{agent.role}</p>
        </div>
        <span>{agent.location}</span>
      </div>
      <p className="personality">{agent.personality}</p>
      <p className="goal">Goal: {agent.goal}</p>
      <p className="warning">Lowest need: {lowestNeed}</p>
    </button>
  );
}

function AgentDetail({ agent }: { agent: AgentProfile }) {
  return (
    <section className="panel detail-panel">
      <div className="section-title">
        <span>Selected agent</span>
        <h2>{agent.name}</h2>
      </div>
      <p className="goal large">{agent.goal}</p>

      <h3>Needs</h3>
      <div className="needs-list">
        {(Object.entries(agent.needs) as Array<[keyof AgentNeeds, number]>).map(([key, value]) => (
          <NeedBar key={key} label={key} value={value} />
        ))}
      </div>

      <h3>Recent memories</h3>
      <div className="memory-list">
        {agent.memories.length === 0 ? (
          <p className="empty">No personal memories yet. Step the world to create life events.</p>
        ) : (
          agent.memories.map((memory) => (
            <article key={memory.id} className="memory">
              <strong>Tick {memory.tick}</strong>
              <p>{memory.text}</p>
              <span>Importance {memory.importance}/10</span>
            </article>
          ))
        )}
      </div>

      <h3>Relationships</h3>
      <div className="relationship-list">
        {agent.relationships.length === 0 ? (
          <p className="empty">No relationship changes yet.</p>
        ) : (
          agent.relationships.map((relationship) => (
            <div key={relationship.agentId} className="relationship">
              <span>{relationship.agentId.replace('agent-', '')}</span>
              <span>Trust {relationship.trust}</span>
              <span>Affinity {relationship.affinity}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function App() {
  const [world, setWorld] = useState(createInitialWorld);
  const [selectedAgentId, setSelectedAgentId] = useState(world.agents[0].id);
  const selectedAgent = world.agents.find((agent) => agent.id === selectedAgentId) ?? world.agents[0];

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">AI Agent Life Simulation</p>
          <h1>Agents that behave like believable people</h1>
          <p>
            A small virtual village where each agent has identity, needs, memory, relationships,
            and a local planner. The next step is adding an LLM adapter for richer dialogue.
          </p>
        </div>
        <div className="world-controls">
          <span>Tick {world.tick}</span>
          <span>{world.timeOfDay}</span>
          <button onClick={() => setWorld((current) => stepWorld(current))}>Step world</button>
          <button onClick={() => setWorld(createInitialWorld())}>Reset</button>
        </div>
      </section>

      <section className="layout">
        <div className="panel agents-panel">
          <div className="section-title">
            <span>Town population</span>
            <h2>{world.agents.length} agents</h2>
          </div>
          <div className="agent-grid">
            {world.agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                selected={agent.id === selectedAgent.id}
                onSelect={() => setSelectedAgentId(agent.id)}
              />
            ))}
          </div>
        </div>

        <AgentDetail agent={selectedAgent} />

        <section className="panel log-panel">
          <div className="section-title">
            <span>World event log</span>
            <h2>Emergent story</h2>
          </div>
          <div className="event-list">
            {world.events.map((event) => (
              <article key={event.id} className="event">
                <strong>Tick {event.tick}</strong>
                <p>{event.text}</p>
                <span>{event.action}</span>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
