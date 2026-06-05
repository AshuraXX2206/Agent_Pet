import type { AgentBrain, AgentBrainResult, AgentObservation, LlmClient } from './types';
import { buildAgentSystemPrompt, buildAgentUserPrompt } from './prompt';

const validActions = new Set(['rest', 'eat', 'socialize', 'work', 'help', 'explore', 'reflect']);

function safeParseBrainResult(raw: string): AgentBrainResult {
  const parsed = JSON.parse(raw) as AgentBrainResult;

  if (!parsed?.decision?.type || !validActions.has(parsed.decision.type)) {
    throw new Error('Invalid AI brain decision action.');
  }

  return {
    thought: {
      intention: parsed.thought?.intention ?? parsed.decision.reason,
      emotion: parsed.thought?.emotion ?? 'unknown',
      remembered: Array.isArray(parsed.thought?.remembered) ? parsed.thought.remembered.slice(0, 5) : [],
      plan: Array.isArray(parsed.thought?.plan) ? parsed.thought.plan.slice(0, 5) : [],
    },
    decision: parsed.decision,
    dialogue: parsed.dialogue,
  };
}

export class LlmBrain implements AgentBrain {
  name = 'LLM Brain Adapter';

  constructor(private readonly client: LlmClient) {}

  async decide(observation: AgentObservation): Promise<AgentBrainResult> {
    const raw = await this.client.complete([
      { role: 'system', content: buildAgentSystemPrompt() },
      { role: 'user', content: buildAgentUserPrompt(observation) },
    ]);

    try {
      return safeParseBrainResult(raw);
    } catch {
      return {
        thought: {
          intention: 'The model returned an invalid decision, so the agent falls back to reflection.',
          emotion: 'confused',
          remembered: [],
          plan: ['Stop unsafe/invalid output', 'Reflect instead'],
        },
        decision: {
          type: 'reflect',
          reason: 'Invalid LLM output fallback.',
        },
      };
    }
  }
}
