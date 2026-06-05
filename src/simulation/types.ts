export type NeedName = 'energy' | 'hunger' | 'social' | 'mood' | 'purpose';

export type AgentRole =
  | 'Inventor'
  | 'Gardener'
  | 'Medic'
  | 'Cook'
  | 'Scout'
  | 'Artist';

export type LocationId = 'square' | 'workshop' | 'garden' | 'clinic' | 'kitchen' | 'studio' | 'forest' | 'lake';

export type TileType = 'grass' | 'path' | 'water' | 'building' | 'garden' | 'forest';

export type AgentActionType =
  | 'rest'
  | 'eat'
  | 'socialize'
  | 'work'
  | 'help'
  | 'explore'
  | 'reflect';

export interface Position {
  x: number;
  y: number;
}

export interface MapTile {
  x: number;
  y: number;
  type: TileType;
  location?: LocationId;
  label?: string;
  walkable: boolean;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: MapTile[];
}

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

export interface AgentThoughtState {
  intention: string;
  emotion: string;
  plan: string[];
}

export interface AgentProfile {
  id: string;
  name: string;
  role: AgentRole;
  personality: string;
  goal: string;
  location: LocationId;
  position: Position;
  needs: AgentNeeds;
  memories: MemoryRecord[];
  relationships: RelationshipRecord[];
  lastThought?: AgentThoughtState;
  lastDialogue?: string;
}

export interface WorldEvent {
  id: string;
  tick: number;
  actorId: string;
  action: AgentActionType;
  text: string;
  thought?: AgentThoughtState;
  dialogue?: string;
}

export interface WorldState {
  tick: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  map: GameMap;
  agents: AgentProfile[];
  events: WorldEvent[];
}

export interface ActionDecision {
  type: AgentActionType;
  targetAgentId?: string;
  location?: LocationId;
  reason: string;
}
