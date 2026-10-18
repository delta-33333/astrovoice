import assert from 'node:assert/strict';
import test from 'node:test';
import { aiBotName, classifyAiSource } from '../lib/attribution.ts';

const cases: Array<{ referrer?: string; utmSource?: string; expect: string | null }> = [
  { referrer: 'https://chatgpt.com/share/abc', expect: 'ai:chatgpt' },
  { referrer: 'https://chat.openai.com/', expect: 'ai:chatgpt' },
  { utmSource: 'chatgpt.com', expect: 'ai:chatgpt' },
  { referrer: 'https://www.perplexity.ai/search', expect: 'ai:perplexity' },
  { utmSource: 'ai:perplexity', expect: 'ai:perplexity' },
  { referrer: 'https://gemini.google.com/app', expect: 'ai:gemini' },
  { referrer: 'https://copilot.microsoft.com/', expect: 'ai:copilot' },
  { referrer: 'https://claude.ai/chat', expect: 'ai:claude' },
  { referrer: 'https://www.google.com/search', expect: null },
  { utmSource: 'tiktok', expect: null },
];

test('les sources IA sont classées', () => {
  assert.equal(cases.length, 10);
  for (const item of cases) {
    assert.equal(classifyAiSource({ referrer: item.referrer, utmSource: item.utmSource }), item.expect, JSON.stringify(item));
  }
  assert.equal(aiBotName('Mozilla/5.0 ChatGPT-User'), 'ChatGPT-User');
  assert.equal(aiBotName('PerplexityBot'), 'PerplexityBot');
  assert.equal(aiBotName('Mozilla/5.0'), null);
});
