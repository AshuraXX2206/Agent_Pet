import type { ActionDecision, AgentProfile, WorldState } from './types';

function lowestNeed(agent: AgentProfile): keyof AgentProfile['needs'] {
  const entries = Object.entries(agent.needs) as Array<[keyof AgentProfile['needs'], number]>;
  return entries.sort((a, b) => a[1] - b[1])[0][0];
}

function findSocialTarget(agent: AgentProfile, world: WorldState): AgentProfile | undefined {
  return world.agents.find((other) => other.id !== agent.id && other.location === agent.location)
    ?? world.agents.find((other) => other.id !== agent.id);
}

export function planNextAction(agent: AgentProfile, world: WorldState): ActionDecision {
  const need = lowestNeed(agent);

  if (agent.needs.energy < 35) {
    return { type: 'rest', reason: `${agent.name} feels drained and needs to recover.` };
  }

  if (agent.needs.hunger < 40) {
    return { type: 'eat', location: 'kitchen', reason: `${agent.name} is hungry and looks for food.` };
  }

  if (agent.needs.social < 45) {
    const target = findSocialTarget(agent, world);
    return {
      type: 'socialize',
      targetAgentId: target?.id,
      reason: `${agent.name} feels disconnected and wants company.`,
    };
  }

  if (agent.needs.mood < 40) {
    return { type: 'reflect', reason: `${agent.name} pauses to process recent feelings.` };
  }

  if (agent.needs.purpose < 45 || need === 'purpose') {
    return { type: 'work', reason: `${agent.name} wants progress toward: ${agent.goal}.` };
  }

  if (agent.role === 'Medic') {
    const tired = world.agents.find((other) => other.id !== agent.id && other.needs.energy < 45);
    if (tired) {
      return {
        type: 'help',
        targetAgentId: tired.id,
        reason: `${agent.name} notices ${tired.name} may need support.`,
      };
    }
  }

  if (agent.role === 'Scout') {
    return { type: 'explore', reason: `${agent.name} wants to discover what changed outside town.` };
  }

  return { type: 'work', reason: `${agent.name} follows a daily routine linked to their personal goal.` };
}
