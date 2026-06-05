import type { LlmChatMessage, LlmClient } from './types';

export class MockLlmClient implements LlmClient {
  async complete(messages: LlmChatMessage[]): Promise<string> {
    const userMessage = messages.findLast((message) => message.role === 'user')?.content ?? '{}';

    try {
      const parsed = JSON.parse(userMessage) as {
        self?: {
          name?: string;
          role?: string;
          goal?: string;
          needs?: Record<string, number>;
        };
        nearbyAgents?: Array<{ id: string; name: string }>;
      };

      const self = parsed.self;
      const needs = self?.needs ?? {};
      const nearby = parsed.nearbyAgents ?? [];
      const lowestNeed = Object.entries(needs).sort((a, b) => a[1] - b[1])[0]?.[0] ?? 'purpose';
      const target = nearby[0];

      let type = 'work';
      if (lowestNeed === 'energy') type = 'rest';
      if (lowestNeed === 'hunger') type = 'eat';
      if (lowestNeed === 'social') type = 'socialize';
      if (lowestNeed === 'mood') type = 'reflect';
      if (lowestNeed === 'purpose') type = self?.role === 'Scout' ? 'explore' : 'work';

      return JSON.stringify({
        thought: {
          intention: `${self?.name ?? 'The agent'} focuses on ${lowestNeed} without breaking character.`,
          emotion: lowestNeed === 'social' ? 'quietly lonely' : 'focused',
          remembered: [],
          plan: [
            `Notice that ${lowestNeed} is the weakest need.`,
            `Choose ${type} as the most believable next action.`,
          ],
        },
        decision: {
          type,
          targetAgentId: type === 'socialize' ? target?.id : undefined,
          location: type === 'eat' ? 'kitchen' : undefined,
          reason: `${self?.name ?? 'The agent'} chooses ${type} because ${lowestNeed} needs attention.`,
        },
        dialogue: type === 'socialize' ? `Maybe ${target?.name ?? 'someone'} has a minute to talk.` : undefined,
      });
    } catch {
      return JSON.stringify({
        thought: {
          intention: 'Recover from unclear observation.',
          emotion: 'uncertain',
          remembered: [],
          plan: ['Pause', 'Reflect'],
        },
        decision: {
          type: 'reflect',
          reason: 'The observation could not be parsed, so the agent reflects.',
        },
      });
    }
  }
}
