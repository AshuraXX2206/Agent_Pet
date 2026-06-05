import type { AgentBrain } from '../ai/types';
import type {
  ActionDecision,
  AgentNeeds,
  AgentProfile,
  AgentThoughtState,
  MemoryRecord,
  RelationshipRecord,
  WorldEvent,
  WorldState,
} from './types';

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function nextTimeOfDay(tick: number): WorldState['timeOfDay'] {
  const phase = tick % 4;
  if (phase === 0) return 'morning';
  if (phase === 1) return 'afternoon';
  if (phase === 2) return 'evening';
  return 'night';
}

function decayNeeds(needs: AgentNeeds): AgentNeeds {
  return {
    energy: clamp(needs.energy - 7),
    hunger: clamp(needs.hunger - 8),
    social: clamp(needs.social - 5),
    mood: clamp(needs.mood - 3),
    purpose: clamp(needs.purpose - 4),
  };
}

function remember(agent: AgentProfile, tick: number, text: string, importance = 5): MemoryRecord[] {
  const memory: MemoryRecord = {
    id: `memory-${agent.id}-${tick}-${agent.memories.length}`,
    tick,
    importance,
    text,
  };

  return [memory, ...agent.memories].slice(0, 8);
}

function updateRelationship(
  relationships: RelationshipRecord[],
  targetAgentId: string,
  tick: number,
  trustDelta: number,
  affinityDelta: number,
): RelationshipRecord[] {
  const existing = relationships.find((relationship) => relationship.agentId === targetAgentId);

  if (!existing) {
    return [
      ...relationships,
      {
        agentId: targetAgentId,
        trust: clamp(50 + trustDelta),
        affinity: clamp(50 + affinityDelta),
        lastInteractionTick: tick,
      },
    ];
  }

  return relationships.map((relationship) =>
    relationship.agentId === targetAgentId
      ? {
          ...relationship,
          trust: clamp(relationship.trust + trustDelta),
          affinity: clamp(relationship.affinity + affinityDelta),
          lastInteractionTick: tick,
        }
      : relationship,
  );
}

function applyDecision(
  agent: AgentProfile,
  world: WorldState,
  decision: ActionDecision,
  thought: AgentThoughtState,
  dialogue?: string,
): { agent: AgentProfile; event: WorldEvent } {
  const needs = decayNeeds(agent.needs);
  const target = decision.targetAgentId
    ? world.agents.find((candidate) => candidate.id === decision.targetAgentId)
    : undefined;

  let nextAgent: AgentProfile = { ...agent, needs };
  let text = decision.reason;
  let importance = 4;

  switch (decision.type) {
    case 'rest':
      nextAgent = {
        ...nextAgent,
        needs: { ...nextAgent.needs, energy: clamp(nextAgent.needs.energy + 35), mood: clamp(nextAgent.needs.mood + 8) },
      };
      text = `${agent.name} rests quietly and regains energy.`;
      break;
    case 'eat':
      nextAgent = {
        ...nextAgent,
        location: 'kitchen',
        needs: { ...nextAgent.needs, hunger: clamp(nextAgent.needs.hunger + 35), mood: clamp(nextAgent.needs.mood + 5) },
      };
      text = `${agent.name} goes to the kitchen and eats something warm.`;
      break;
    case 'socialize':
      nextAgent = {
        ...nextAgent,
        needs: { ...nextAgent.needs, social: clamp(nextAgent.needs.social + 25), mood: clamp(nextAgent.needs.mood + 8) },
        relationships: target
          ? updateRelationship(nextAgent.relationships, target.id, world.tick + 1, 4, 6)
          : nextAgent.relationships,
      };
      text = target
        ? `${agent.name} talks with ${target.name}. The conversation makes the day feel less lonely.`
        : `${agent.name} looks for someone to talk to but finds the village unusually quiet.`;
      importance = 6;
      break;
    case 'work':
      nextAgent = {
        ...nextAgent,
        needs: { ...nextAgent.needs, purpose: clamp(nextAgent.needs.purpose + 25), energy: clamp(nextAgent.needs.energy - 5) },
      };
      text = `${agent.name} works on their goal: ${agent.goal}.`;
      break;
    case 'help':
      nextAgent = {
        ...nextAgent,
        needs: { ...nextAgent.needs, social: clamp(nextAgent.needs.social + 12), purpose: clamp(nextAgent.needs.purpose + 15) },
        relationships: target
          ? updateRelationship(nextAgent.relationships, target.id, world.tick + 1, 8, 5)
          : nextAgent.relationships,
      };
      text = target
        ? `${agent.name} helps ${target.name} after noticing they seemed worn down.`
        : `${agent.name} prepares to help someone, but cannot find who needs it most.`;
      importance = 7;
      break;
    case 'explore':
      nextAgent = {
        ...nextAgent,
        location: 'square',
        needs: { ...nextAgent.needs, purpose: clamp(nextAgent.needs.purpose + 18), mood: clamp(nextAgent.needs.mood + 6) },
      };
      text = `${agent.name} scouts the edge of town and returns with small observations.`;
      break;
    case 'reflect':
      nextAgent = {
        ...nextAgent,
        needs: { ...nextAgent.needs, mood: clamp(nextAgent.needs.mood + 18), purpose: clamp(nextAgent.needs.purpose + 8) },
      };
      text = `${agent.name} reflects on recent events and adjusts their priorities.`;
      importance = 8;
      break;
  }

  nextAgent = {
    ...nextAgent,
    lastThought: thought,
    lastDialogue: dialogue,
    memories: remember(nextAgent, world.tick + 1, dialogue ? `${text} "${dialogue}"` : text, importance),
  };

  return {
    agent: nextAgent,
    event: {
      id: `event-${world.tick + 1}-${agent.id}`,
      tick: world.tick + 1,
      actorId: agent.id,
      action: decision.type,
      text,
      thought,
      dialogue,
    },
  };
}

async function resolveAgent(agent: AgentProfile, world: WorldState, brain: AgentBrain) {
  const nearbyAgents = world.agents.filter((candidate) => candidate.id !== agent.id && candidate.location === agent.location);
  const fallbackNearbyAgents = nearbyAgents.length > 0
    ? nearbyAgents
    : world.agents.filter((candidate) => candidate.id !== agent.id).slice(0, 2);

  const result = await brain.decide({
    agent,
    world: { tick: world.tick, timeOfDay: world.timeOfDay },
    nearbyAgents: fallbackNearbyAgents,
    recentEvents: world.events,
  });

  return applyDecision(agent, world, result.decision, result.thought, result.dialogue);
}

export async function stepWorldWithBrain(world: WorldState, brain: AgentBrain): Promise<WorldState> {
  const results = await Promise.all(world.agents.map((agent) => resolveAgent(agent, world, brain)));

  return {
    tick: world.tick + 1,
    timeOfDay: nextTimeOfDay(world.tick + 1),
    agents: results.map((result) => result.agent),
    events: [...results.map((result) => result.event), ...world.events].slice(0, 50),
  };
}
