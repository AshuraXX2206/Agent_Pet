export type NeedName = 'energy' | 'hunger' | 'social' | 'mood' | 'purpose';

export type AgentRole =
  | 'Inventor'
  | 'Gardener'
  | 'Medic'
  | 'Cook'
  | 'Scout'
  | 'Artist';

export type LocationId = 'square' | 'workshop' | 'garden' | 'clinic' | 'kitchen' | 'studio';

export type AgentActionType =
  | 'rest'
  | 'eat'
  | 'socialize'
  | 'work'
  | 'help'
  | 'explore'
  | 'reflect';

export interface AgentNeeds {
  energy: number;
  hunger: number;
  social: number;
  mood: number;
  purpose: number;
}

export interface MemoryRecord {
  id: string;
  tick: number;
  importance: number;
  text: string;
}

export interface RelationshipRecord {
  agentId: string;
  trust: number;
  affinity: number;
  lastInteractionTick: number;
}

export interface AgentProfile {
  id: string;
  name: string;
  role: AgentRole;
  personality: string;
  goal: string;
  location: LocationId;
  needs: AgentNeeds;
  memories: MemoryRecord[];
  relationships: RelationshipRecord[];
}

export interface WorldEvent {
  id: string;
  tick: number;
  actorId: string;
  action: AgentActionType;
  text: string;
}

export interface WorldState {
  tick: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  agents: AgentProfile[];
  events: WorldEvent[];
}

export interface ActionDecision {
  type: AgentActionType;
  targetAgentId?: string;
  location?: LocationId;
  reason: string;
}
