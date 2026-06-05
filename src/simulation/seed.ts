import type { AgentProfile, WorldState } from './types';

const baseNeeds = {
  energy: 75,
  hunger: 70,
  social: 60,
  mood: 65,
  purpose: 55,
};

export const seedAgents: AgentProfile[] = [
  {
    id: 'agent-mira',
    name: 'Mira',
    role: 'Inventor',
    personality: 'curious, intense, optimistic',
    goal: 'build a machine that helps the town save time',
    location: 'workshop',
    needs: { ...baseNeeds, purpose: 80, social: 45 },
    memories: [],
    relationships: [],
  },
  {
    id: 'agent-kai',
    name: 'Kai',
    role: 'Gardener',
    personality: 'calm, patient, protective',
    goal: 'keep the village garden alive',
    location: 'garden',
    needs: { ...baseNeeds, mood: 80, hunger: 55 },
    memories: [],
    relationships: [],
  },
  {
    id: 'agent-lena',
    name: 'Lena',
    role: 'Medic',
    personality: 'empathetic, observant, careful',
    goal: 'notice who is struggling before they ask for help',
    location: 'clinic',
    needs: { ...baseNeeds, social: 75, energy: 60 },
    memories: [],
    relationships: [],
  },
  {
    id: 'agent-orin',
    name: 'Orin',
    role: 'Cook',
    personality: 'warm, funny, practical',
    goal: 'make meals that bring people together',
    location: 'kitchen',
    needs: { ...baseNeeds, social: 80, purpose: 70 },
    memories: [],
    relationships: [],
  },
  {
    id: 'agent-rin',
    name: 'Rin',
    role: 'Scout',
    personality: 'restless, brave, suspicious',
    goal: 'map unknown paths around the village',
    location: 'square',
    needs: { ...baseNeeds, energy: 85, mood: 50 },
    memories: [],
    relationships: [],
  },
];

export function createInitialWorld(): WorldState {
  return {
    tick: 0,
    timeOfDay: 'morning',
    agents: seedAgents,
    events: [
      {
        id: 'event-start',
        tick: 0,
        actorId: 'system',
        action: 'reflect',
        text: 'The village wakes up. Everyone starts the day with private goals and fragile routines.',
      },
    ],
  };
}
