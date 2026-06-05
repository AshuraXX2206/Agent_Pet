import type { AgentProfile, WorldEvent, WorldState, ActionDecision } from '../simulation/types';

export interface AgentObservation {
  agent: AgentProfile;
  world: Pick<WorldState, 'tick' | 'timeOfDay'>;
  nearbyAgents: AgentProfile[];
  recentEvents: WorldEvent[];
}

export interface AgentThought {
  intention: string;
  emotion: string;
  remembered: string[];
  plan: string[];
}

export interface AgentBrainResult {
  thought: AgentThought;
  decision: ActionDecision;
  dialogue?: string;
}

export interface AgentBrain {
  name: string;
  decide(observation: AgentObservation): Promise<AgentBrainResult>;
}

export interface LlmChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmClient {
  complete(messages: LlmChatMessage[]): Promise<string>;
}
