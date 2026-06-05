import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LlmBrain } from './ai/llmBrain';
import { localBrain } from './ai/localBrain';
import { MockLlmClient } from './ai/mockLlmClient';
import type { AgentBrain } from './ai/types';
import { stepWorldWithBrain } from './simulation/engine';
import { createInitialWorld } from './simulation/seed';
import type { AgentNeeds, AgentProfile, MapTile, WorldState } from './simulation/types';
import './styles.css';

type BrainMode = 'local' | 'mock-llm';

const mockLlmBrain = new LlmBrain(new MockLlmClient());
const roleIcon: Record<AgentProfile['role'], string> = {
  Inventor: '⚙️',
  Gardener: '🌱',
  Medic: '💊',
  Cook: '🍲',
  Scout: '🧭',
  Artist: '🎨',
};

function getBrain(mode: BrainMode): AgentBrain {
  return mode === 'local' ? localBrain : mockLlmBrain;
}

function roleClass(role: AgentProfile['role']): string {
  return role.toLowerCase();
}

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

function AgentPawn({ agent, selected, onSelect }: { agent: AgentProfile; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`agent-pawn ${selected ? 'selected' : ''}`} onClick={onSelect} title={`${agent.name} - ${agent.role}`}>
      <span className={`character-sprite role-${roleClass(agent.role)}`}>
        <span className="sprite-shadow" />
        <span className="sprite-legs" />
        <span className="sprite-body">
          <span className="sprite-arm left" />
          <span className="sprite-arm right" />
        </span>
        <span className="sprite-head">
          <span className="sprite-hair" />
          <span className="sprite-face" />
        </span>
        <span className="sprite-badge">{roleIcon[agent.role]}</span>
        <span className="sprite-name">{agent.name}</span>
      </span>
    </button>
  );
}

function GameTile({ tile, agents, selectedAgentId, onSelectAgent }: {
  tile: MapTile;
  agents: AgentProfile[];
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
}) {
  return (
    <div className={`game-tile tile-${tile.type} ${tile.walkable ? 'walkable' : 'blocked'}`}>
      {tile.label ? <span className="tile-label">{tile.label}</span> : null}
      <div className="pawn-stack">
        {agents.map((agent) => (
          <AgentPawn
            key={agent.id}
            agent={agent}
            selected={agent.id === selectedAgentId}
            onSelect={() => onSelectAgent(agent.id)}
          />
        ))}
      </div>
    </div>
  );
}

function GameMapView({ world, selectedAgentId, onSelectAgent }: {
  world: WorldState;
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
}) {
  return (
    <section className="game-stage">
      <div
        className="game-map"
        style={{
          gridTemplateColumns: `repeat(${world.map.width}, minmax(44px, 1fr))`,
        }}
      >
        {world.map.tiles.map((tile) => {
          const agents = world.agents.filter((agent) => agent.position.x === tile.x && agent.position.y === tile.y);
          return (
            <GameTile
              key={`${tile.x}-${tile.y}`}
              tile={tile}
              agents={agents}
              selectedAgentId={selectedAgentId}
              onSelectAgent={onSelectAgent}
            />
          );
        })}
      </div>
    </section>
  );
}

function AgentDetail({ agent }: { agent: AgentProfile }) {
  const lowestNeed = useMemo(() => {
    return Object.entries(agent.needs).sort((a, b) => a[1] - b[1])[0][0];
  }, [agent.needs]);

  return (
    <section className="side-panel detail-panel">
      <div className="section-title">
        <span>Selected character</span>
        <h2>{roleIcon[agent.role]} {agent.name}</h2>
      </div>
      <p className="goal large">{agent.goal}</p>
      <p className="agent-meta">{agent.role} · {agent.location} · x{agent.position.x}, y{agent.position.y}</p>
      <p className="warning">Lowest need: {lowestNeed}</p>
      {agent.lastDialogue ? <p className="dialogue-line">“{agent.lastDialogue}”</p> : null}

      <h3>Private thought</h3>
      {agent.lastThought ? (
        <div className="thought-box">
          <p><strong>Emotion:</strong> {agent.lastThought.emotion}</p>
          <p><strong>Intention:</strong> {agent.lastThought.intention}</p>
          <ul>
            {agent.lastThought.plan.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="empty">No thought yet. Step the game to let the agent think.</p>
      )}

      <h3>Needs</h3>
      <div className="needs-list">
        {(Object.entries(agent.needs) as Array<[keyof AgentNeeds, number]>).map(([key, value]) => (
          <NeedBar key={key} label={key} value={value} />
        ))}
      </div>

      <h3>Recent memories</h3>
      <div className="memory-list compact-scroll">
        {agent.memories.length === 0 ? (
          <p className="empty">No personal memories yet.</p>
        ) : (
          agent.memories.map((memory) => (
            <article key={memory.id} className="memory">
              <strong>Tick {memory.tick}</strong>
              <p>{memory.text}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function EventLog({ world }: { world: WorldState }) {
  return (
    <section className="side-panel log-panel">
      <div className="section-title">
        <span>Game log</span>
        <h2>Emergent story</h2>
      </div>
      <div className="event-list compact-scroll">
        {world.events.map((event) => (
          <article key={event.id} className="event">
            <strong>Tick {event.tick}</strong>
            <p>{event.text}</p>
            {event.dialogue ? <p className="dialogue-line">“{event.dialogue}”</p> : null}
            {event.thought ? <small>{event.thought.emotion} · {event.thought.intention}</small> : null}
            <span>{event.action}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [world, setWorld] = useState(createInitialWorld);
  const [selectedAgentId, setSelectedAgentId] = useState(world.agents[0].id);
  const [brainMode, setBrainMode] = useState<BrainMode>('mock-llm');
  const [isStepping, setIsStepping] = useState(false);
  const selectedAgent = world.agents.find((agent) => agent.id === selectedAgentId) ?? world.agents[0];
  const activeBrain = getBrain(brainMode);

  async function handleStep() {
    setIsStepping(true);
    try {
      const nextWorld = await stepWorldWithBrain(world, activeBrain);
      setWorld(nextWorld);
    } finally {
      setIsStepping(false);
    }
  }

  function handleReset() {
    const nextWorld = createInitialWorld();
    setWorld(nextWorld);
    setSelectedAgentId(nextWorld.agents[0].id);
  }

  return (
    <main className="game-shell">
      <header className="game-hud">
        <div>
          <p className="eyebrow">Agent Pet Game Prototype</p>
          <h1>Living AI Village</h1>
        </div>
        <div className="hud-controls">
          <span>Tick {world.tick}</span>
          <span>{world.timeOfDay}</span>
          <span>{activeBrain.name}</span>
          <select value={brainMode} onChange={(event) => setBrainMode(event.target.value as BrainMode)}>
            <option value="mock-llm">Mock LLM Brain</option>
            <option value="local">Local Heuristic Brain</option>
          </select>
          <button onClick={handleStep} disabled={isStepping}>{isStepping ? 'Thinking...' : 'Next Turn'}</button>
          <button onClick={handleReset}>Reset</button>
        </div>
      </header>

      <section className="game-layout">
        <AgentDetail agent={selectedAgent} />
        <GameMapView world={world} selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} />
        <EventLog world={world} />
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
