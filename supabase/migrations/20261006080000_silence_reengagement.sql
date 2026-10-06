-- Relance en cas de silence pendant l'appel vocal.
-- 1) Événements de suivi : call_reengage (relance après ~7 s de silence) et call_silence_end
--    (fin automatique après 90 s de silence complet suivant la 2e relance).
-- 2) Les quelques personas qui disaient « le silence est laissé » sont alignées sur la règle commune
--    (courte pause respectée, puis relance douce) ajoutée au prompt de base dans lib/voice-prompts.ts.
-- Réversible :
--   UPDATE callastral.advisors a SET persona_prompt = b.persona_prompt
--   FROM callastral.advisor_persona_backup b
--   WHERE b.advisor_id = a.id AND b.migration = '20261006080000_silence_reengagement';
--   et rétablir events_name_check sans les deux nouveaux noms.

ALTER TABLE callastral.events DROP CONSTRAINT IF EXISTS events_name_check;
ALTER TABLE callastral.events ADD CONSTRAINT events_name_check CHECK (name = ANY (ARRAY[
  'view_home', 'view_advisor', 'select_slot', 'signup', 'checkout_start', 'payment_success',
  'call_started', 'call_completed', 'visit', 'birth_data', 'slot_selected', 'checkout_started',
  'paid', 'summary_bought', 'call_reengage', 'call_silence_end'
]::text[]));

INSERT INTO callastral.advisor_persona_backup (advisor_id, migration, persona_prompt, saved_at)
SELECT DISTINCT ON (a.id) a.id, '20261006080000_silence_reengagement', a.persona_prompt, now()
FROM callastral.advisors a
JOIN (VALUES
  ('- Le silence est laissé quand la personne cherche ses mots.',
   '- Une courte pause est laissée quand la personne cherche ses mots ; après un long silence, relance avec douceur.'),
  ('- Silence is left in place when someone is searching for words.',
   '- A short pause is left when someone is searching for words; after a long silence, gently re-engage.'),
  ('- El silencio se respeta cuando la persona busca las palabras.',
   '- Se respeta una pausa corta cuando la persona busca las palabras; tras un silencio largo, retómala con suavidad.'),
  ('- Stille bleibt, wenn jemand nach Worten sucht.',
   '- Eine kurze Pause bleibt, wenn jemand nach Worten sucht; nach längerer Stille fragst du sanft nach.'),
  ('- Il silenzio resta quando la persona cerca le parole.',
   '- Una breve pausa resta quando la persona cerca le parole; dopo un lungo silenzio, riprendila con dolcezza.')) AS s(old_line, new_line) ON position(s.old_line IN a.persona_prompt) > 0
ON CONFLICT (advisor_id, migration) DO NOTHING;

UPDATE callastral.advisors a
SET persona_prompt = replace(a.persona_prompt, s.old_line, s.new_line)
FROM (VALUES
  ('- Le silence est laissé quand la personne cherche ses mots.',
   '- Une courte pause est laissée quand la personne cherche ses mots ; après un long silence, relance avec douceur.'),
  ('- Silence is left in place when someone is searching for words.',
   '- A short pause is left when someone is searching for words; after a long silence, gently re-engage.'),
  ('- El silencio se respeta cuando la persona busca las palabras.',
   '- Se respeta una pausa corta cuando la persona busca las palabras; tras un silencio largo, retómala con suavidad.'),
  ('- Stille bleibt, wenn jemand nach Worten sucht.',
   '- Eine kurze Pause bleibt, wenn jemand nach Worten sucht; nach längerer Stille fragst du sanft nach.'),
  ('- Il silenzio resta quando la persona cerca le parole.',
   '- Una breve pausa resta quando la persona cerca le parole; dopo un lungo silenzio, riprendila con dolcezza.')) AS s(old_line, new_line)
WHERE position(s.old_line IN a.persona_prompt) > 0;
