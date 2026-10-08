-- Corrections and new-court suggestions sent from the site. Reviewed by the owner, then
-- applied by editing venue YAML in apps/data.
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('edit', 'new')),
  venue_slug TEXT,
  venue_name TEXT,
  message TEXT NOT NULL,
  source TEXT,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected')),
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  reviewed_at TEXT
);
CREATE INDEX submissions_status ON submissions (status, created_at);
