import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CHAT_CTA,
  CHAT_MONTHLY_CAP,
  CHAT_PRICE_CENTS,
  chatEntitlement,
  chatPath,
  chatStartIssue,
  chatSystemPrompt,
  ensureFollowUp,
} from '../lib/chat.ts';

test('1 message offert, puis paywall, puis abonnement plafonné à 300/mois', () => {
  assert.equal(CHAT_PRICE_CENTS, 690);
  assert.equal(CHAT_MONTHLY_CAP, 300);
  assert.deepEqual(chatEntitlement({ freeUsed: false, subscriptionStatus: null, periodEnd: null, periodMessages: 0 }), { allowed: true, kind: 'free', remaining: 1 });
  assert.deepEqual(chatEntitlement({ freeUsed: true, subscriptionStatus: null, periodEnd: null, periodMessages: 0 }), { allowed: false, reason: 'paywall' });
  assert.deepEqual(chatEntitlement({ freeUsed: true, subscriptionStatus: 'canceled', periodEnd: null, periodMessages: 0 }), { allowed: false, reason: 'paywall' });
  const future = new Date(Date.now() + 86400_000 * 20).toISOString();
  assert.equal(chatEntitlement({ freeUsed: true, subscriptionStatus: 'active', periodEnd: future, periodMessages: 12 }).allowed, true);
  assert.deepEqual(chatEntitlement({ freeUsed: true, subscriptionStatus: 'active', periodEnd: future, periodMessages: 300 }), { allowed: false, reason: 'cap' });
});

test('formulaire : email requis, heure facultative si inconnue', () => {
  const base = { email: 'a@b.fr', firstName: 'Léa', birthDate: '1990-05-04', birthTime: '', timeUnknown: true, birthPlace: 'Lyon', topic: 'love', question: 'Va-t-il revenir ?' };
  assert.equal(chatStartIssue(base), null);
  assert.equal(chatStartIssue({ ...base, email: 'nope' }), 'email');
  assert.equal(chatStartIssue({ ...base, timeUnknown: false }), 'birthTime');
  assert.equal(chatStartIssue({ ...base, timeUnknown: false, birthTime: '14:30' }), null);
  assert.equal(chatStartIssue({ ...base, topic: 'santé' }), 'topic');
});

test('relance toujours présente, CTA FR exact, consignes conformes', () => {
  assert.match(ensureFollowUp('Votre Vénus est en Lion.', 'fr'), /\?$/);
  assert.equal(ensureFollowUp('Et vous, qu’en pensez-vous ?', 'fr'), 'Et vous, qu’en pensez-vous ?');
  assert.equal(CHAT_CTA.fr, 'Pose ta question par message, 1ère réponse offerte');
  assert.equal(chatPath('en'), '/en/chat');
  const prompt = chatSystemPrompt({ locale: 'fr', advisorName: 'Léa Durand', advisorLabel: 'Conseillère Callastral', personaPrompt: 'Douce.', firstName: 'Ana', birth: '1990-05-04', place: 'Lyon', timeUnknown: true, topic: 'love', chartText: 'Soleil Taureau', today: '2026-10-27' });
  assert.match(prompt, /Conseillère Callastral/);
  assert.match(prompt, /questions de relance/);
  assert.doesNotMatch(prompt, new RegExp(['astrology', 'api'].join('-'), 'i'));
});
