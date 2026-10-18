import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FREE_CALL_SECONDS,
  clampTrialSeconds,
  freeCallDailyCap,
  freeCallEnabled,
  networkKey,
  remainingTrialSeconds,
  trialEmailNorm,
  trialStartDecision,
} from '../lib/free-call.ts';

test('l’essai dure 180 s, un par e-mail, appareil et /24, cap 50', () => {
  assert.equal(FREE_CALL_SECONDS, 180);
  assert.equal(freeCallEnabled({ FREE_CALL_ENABLED: '' }), true);
  assert.equal(freeCallEnabled({ FREE_CALL_ENABLED: 'false' }), false);
  assert.equal(freeCallEnabled({ FREE_CALL_ENABLED: 'off' }), false);
  assert.equal(freeCallDailyCap({ FREE_CALL_DAILY_CAP: '' }), 50);
  assert.equal(freeCallDailyCap({ FREE_CALL_DAILY_CAP: '12' }), 12);
  assert.equal(networkKey('203.0.113.44'), '203.0.113.0');
  assert.equal(trialEmailNorm('A.B+tag@gmail.com'), 'ab@gmail.com');
  assert.equal(trialStartDecision({
    enabled: true,
    disposable: false,
    sameEmailExists: false,
    deviceUsedByOther: true,
    ipUsedByOther: false,
    alreadyPaid: false,
    verifiedToday: 0,
    cap: 50,
  }), 'device');
  assert.equal(trialStartDecision({
    enabled: true,
    disposable: false,
    sameEmailExists: false,
    deviceUsedByOther: false,
    ipUsedByOther: false,
    alreadyPaid: false,
    verifiedToday: 50,
    cap: 50,
  }), 'cap');
  assert.equal(remainingTrialSeconds({ secondsUsed: 0, tokenIssuedAt: null }), 180);
  assert.equal(clampTrialSeconds(9999), 180);
});
