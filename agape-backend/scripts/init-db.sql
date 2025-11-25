
-- CREATE DATABASE agape_looks;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- GRANT ALL PRIVILEGES ON DATABASE agape_looks TO agape_app;

DO $$
BEGIN
  RAISE NOTICE 'AGAPE LOOKS database initialized successfully';
  RAISE NOTICE 'Extensions enabled: uuid-ossp, pg_trgm';
END $$;
