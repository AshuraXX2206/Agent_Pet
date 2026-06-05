import { planNextAction } from '../simulation/planner';
import type { AgentBrain, AgentBrainResult, AgentObservation } from './types';

function emotionFromNeeds(observation: AgentObservation): string {
  const { needs } = observation.agent;
  if (needs.energy < 35) return 'exhausted';
  if (needs.hunger < 40) return 'distracted by hunger';
  if (needs.social < 45) return 'lonely';
  if (needs.mood < 40) return 'uneasy';
  if (needs.purpose < 45) return 'restless';
  return 'steady';
}

export const localBrain: AgentBrain = {
  name: 'Local Heuristic Brain',
  async decide(observation: AgentObservation): Promise<AgentBrainResult> {
    const decision = planNextAction(observation.agent, {
      tick: observation.world.tick,
      timeOfDay: observation.world.timeOfDay,
      agents: [observation.agent, ...observation.nearbyAgents],
      events: observation.recentEvents,
    });

    const remembered = observation.agent.memories.slice(0, 2).map((memory) => memory.text);
    const emotion = emotionFromNeeds(observation);

    return {
      thought: {
        intention: decision.reason,
        emotion,
        remembered,
        plan: [
          'Check the most urgent need.',
          'Compare the need with the personal goal and nearby agents.',
          `Choose action: ${decision.type}.`,
        ],
      },
      decision,
      dialogue: decision.type === 'socialize' ? 'I should not spend the whole day alone.' : undefined,
    };
  },
};
