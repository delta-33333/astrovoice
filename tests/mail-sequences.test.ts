import assert from 'node:assert/strict';
import test from 'node:test';
import { cancelRemaining, dueSequenceIds, trialFollowupMails, TRIAL_FOLLOWUP_OFFSETS_MS } from '../lib/sequences.ts';

test('le suivi d’essai part à J+0, J+1 et J+3, et le paiement annule le reste', () => {
  const from = new Date('2026-10-18T08:00:00.000Z');
  const mails = trialFollowupMails({
    locale: 'fr',
    advisorName: 'Léa',
    summary: 'Question sur le travail.',
    resumeUrl: 'https://callastral.com/book?offer=decouverte',
    unsubscribeUrl: 'https://callastral.com/api/email/unsubscribe?token=abc',
    from,
  });
  assert.deepEqual(mails.map((mail) => mail.kind), ['trial_followup_0', 'trial_followup_1', 'trial_followup_3']);
  assert.deepEqual(
    mails.map((mail) => Date.parse(mail.sendAt) - from.getTime()),
    [...TRIAL_FOLLOWUP_OFFSETS_MS],
  );
  assert.match(mails[0].html, /1,99|Découverte/);
  assert.equal(mails[0].html.includes('31 octobre'), false);
  const pending = mails.map((mail, index) => ({
    id: String(index),
    kind: mail.kind,
    sentAt: index === 0 ? from.toISOString() : null,
    cancelledAt: null,
  }));
  assert.deepEqual(cancelRemaining(pending), ['1', '2']);
  const due = dueSequenceIds([
    { id: 'a', sendAt: '2026-10-18T07:00:00.000Z', sentAt: null, cancelledAt: null },
    { id: 'b', sendAt: '2026-10-19T08:00:00.000Z', sentAt: null, cancelledAt: null },
  ], from);
  assert.deepEqual(due, ['a']);
});
