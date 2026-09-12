CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  aliases TEXT,
  island TEXT,
  settlement TEXT,
  offence TEXT,
  court TEXT,
  case_ref TEXT,
  conviction_date TEXT,
  sentence TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_date TEXT,
  photo_url TEXT,
  record_type TEXT NOT NULL DEFAULT 'conviction',
  status_note TEXT,
  publication_status TEXT NOT NULL DEFAULT 'published',
  last_verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_records_publication ON records(publication_status);
CREATE INDEX IF NOT EXISTS idx_records_location ON records(island, settlement);
CREATE INDEX IF NOT EXISTS idx_records_name ON records(name);

CREATE TABLE IF NOT EXISTS community_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identity_match_key TEXT NOT NULL,
  encrypted_identity TEXT NOT NULL,
  island TEXT NOT NULL,
  settlement TEXT,
  account_type TEXT NOT NULL CHECK(account_type IN ('firsthand','secondhand')),
  relationship TEXT NOT NULL,
  conduct TEXT NOT NULL,
  period TEXT,
  victim_age_group TEXT NOT NULL,
  repeat_pattern TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_community_match ON community_reports(identity_match_key);
CREATE INDEX IF NOT EXISTS idx_community_location ON community_reports(island, settlement);
CREATE INDEX IF NOT EXISTS idx_community_conduct ON community_reports(conduct);

CREATE TABLE IF NOT EXISTS source_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  reported_status TEXT NOT NULL,
  island TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS corrections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT
);
