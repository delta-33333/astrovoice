-- Consignes vocales : la ligne « domaines » liste les spécialités dans la langue de l'appel
-- (en/es/de/it ; le français est déjà correct). Schéma callastral uniquement.
-- Réversible : l'ancienne consigne est copiée dans callastral.advisor_persona_backup avant la mise à jour.
-- Retour arrière :
--   UPDATE callastral.advisors a SET persona_prompt = b.persona_prompt
--   FROM callastral.advisor_persona_backup b
--   WHERE b.advisor_id = a.id AND b.migration = '20261004070000_persona_specialties_localized';

CREATE TABLE IF NOT EXISTS callastral.advisor_persona_backup (
  advisor_id uuid NOT NULL REFERENCES callastral.advisors(id) ON DELETE CASCADE,
  migration text NOT NULL,
  persona_prompt text NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (advisor_id, migration)
);
ALTER TABLE callastral.advisor_persona_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.advisor_persona_backup FORCE ROW LEVEL SECURITY;
REVOKE ALL ON callastral.advisor_persona_backup FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON callastral.advisor_persona_backup TO service_role;

WITH words(lang, fr, word) AS (
  VALUES
    ('en', 'amour', 'love'), ('en', 'carrière', 'career'), ('en', 'spiritualité', 'spirituality'),
    ('en', 'transition de vie', 'life transitions'), ('en', 'compatibilité', 'compatibility'),
    ('en', 'argent', 'money'), ('en', 'famille', 'family'),
    ('es', 'amour', 'amor'), ('es', 'carrière', 'carrera'), ('es', 'spiritualité', 'espiritualidad'),
    ('es', 'transition de vie', 'transiciones vitales'), ('es', 'compatibilité', 'compatibilidad'),
    ('es', 'argent', 'dinero'), ('es', 'famille', 'familia'),
    ('de', 'amour', 'Liebe'), ('de', 'carrière', 'Karriere'), ('de', 'spiritualité', 'Spiritualität'),
    ('de', 'transition de vie', 'Lebensübergänge'), ('de', 'compatibilité', 'Kompatibilität'),
    ('de', 'argent', 'Geld'), ('de', 'famille', 'Familie'),
    ('it', 'amour', 'amore'), ('it', 'carrière', 'carriera'), ('it', 'spiritualité', 'spiritualità'),
    ('it', 'transition de vie', 'transizioni di vita'), ('it', 'compatibilité', 'compatibilità'),
    ('it', 'argent', 'denaro'), ('it', 'famille', 'famiglia')
),
prefix(lang, label) AS (
  VALUES ('en', 'Your areas: '), ('es', 'Tus ámbitos: '), ('de', 'Deine Gebiete: '), ('it', 'I tuoi ambiti: ')
),
target AS (
  SELECT
    a.id,
    p.label || array_to_string(a.specialties, ', ') || '.' AS old_line,
    p.label || (
      SELECT string_agg(coalesce(w.word, s.spec), ', ' ORDER BY s.ord)
      FROM unnest(a.specialties) WITH ORDINALITY AS s(spec, ord)
      LEFT JOIN words w ON w.lang = a.languages[1] AND w.fr = s.spec
    ) || '.' AS new_line
  FROM callastral.advisors a
  JOIN prefix p ON p.lang = a.languages[1]
  WHERE a.persona_prompt IS NOT NULL
),
changed AS (
  SELECT t.* FROM target t
  JOIN callastral.advisors a ON a.id = t.id
  WHERE t.old_line <> t.new_line AND position(t.old_line IN a.persona_prompt) > 0
),
saved AS (
  INSERT INTO callastral.advisor_persona_backup (advisor_id, migration, persona_prompt)
  SELECT a.id, '20261004070000_persona_specialties_localized', a.persona_prompt
  FROM callastral.advisors a JOIN changed c ON c.id = a.id
  ON CONFLICT (advisor_id, migration) DO NOTHING
  RETURNING advisor_id
)
UPDATE callastral.advisors a
SET persona_prompt = replace(a.persona_prompt, c.old_line, c.new_line)
FROM changed c
WHERE a.id = c.id;
