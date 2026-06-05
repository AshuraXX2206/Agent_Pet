import type { AgentObservation } from './types';

export function buildAgentSystemPrompt(): string {
  return [
    'You are the private mind of a believable game character, not a generic chatbot.',
    'You must think as the character based on identity, needs, memories, relationships, and recent world events.',
    'Choose exactly one action from: rest, eat, socialize, work, help, explore, reflect.',
    'Keep choices grounded in the game state. Do not invent impossible locations or powers.',
    'Return strict JSON only. No markdown.',
    'JSON schema:',
    '{',
    '  "thought": {',
    '    "intention": "short intention",',
    '    "emotion": "short emotional state",',
    '    "remembered": ["memory text"],',
    '    "plan": ["step 1", "step 2"]',
    '  },',
    '  "decision": {',
    '    "type": "rest|eat|socialize|work|help|explore|reflect",',
    '    "targetAgentId": "optional agent id",',
    '    "location": "optional location id",',
    '    "reason": "why this action makes sense"',
    '  },',
    '  "dialogue": "optional one short line of in-character speech"',
    '}',
  ].join('\n');
}

export function buildAgentUserPrompt(observation: AgentObservation): string {
  const { agent, world, nearbyAgents, recentEvents } = observation;

  return JSON.stringify(
    {
      world,
      self: {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        personality: agent.personality,
        goal: agent.goal,
        location: agent.location,
        needs: agent.needs,
        memories: agent.memories.slice(0, 5),
        relationships: agent.relationships,
      },
      nearbyAgents: nearbyAgents.map((nearby) => ({
        id: nearby.id,
        name: nearby.name,
        role: nearby.role,
        location: nearby.location,
        needs: nearby.needs,
      })),
      recentEvents: recentEvents.slice(0, 8),
      instruction: 'Decide the next believable action for this agent.',
    },
    null,
    2,
  );
}
