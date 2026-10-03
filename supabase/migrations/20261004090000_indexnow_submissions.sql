-- Journal des soumissions IndexNow : une soumission automatique par déploiement de production.
-- Réversible : DROP TABLE callastral.indexnow_submissions;

CREATE TABLE IF NOT EXISTS callastral.indexnow_submissions (
  deployment_id text PRIMARY KEY,
  status int,
  url_count int NOT NULL DEFAULT 0,
  trigger text NOT NULL DEFAULT 'deploy',
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE callastral.indexnow_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.indexnow_submissions FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE callastral.indexnow_submissions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE callastral.indexnow_submissions TO service_role;
