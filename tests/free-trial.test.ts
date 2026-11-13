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

test('essai allégé : consentement IA obligatoire, appareil/réseau/plafond vérifiés, e-mail après l’appel', async () => {
  const fsm = await import('node:fs');
  const route = fsm.readFileSync('app/api/trial/quick/route.ts', 'utf8');
  assert.match(route, /body\?\.consent !== true/);
  assert.match(route, /tooManyRequests\(request, 'trial-quick'/);
  const store = fsm.readFileSync('lib/free-call-store.ts', 'utf8');
  const quick = store.slice(store.indexOf('export async function beginQuickTrial'));
  assert.match(quick, /deviceUsedByOther: deviceUsed > 0/);
  assert.match(quick, /ipUsedByOther: ipUsed > 0/);
  assert.match(quick, /cap: freeCallDailyCap\(\)/);
  const form = fsm.readFileSync('components/FreeTrialForm.tsx', 'utf8');
  assert.match(form, /\/api\/trial\/quick/);
  assert.match(form, /copy\.consent/);
  assert.doesNotMatch(form, /type="email"/);
});
