-- 0001_rag.sql — code retrieval for the portfolio assistant.
--
-- Idempotent throughout (IF NOT EXISTS): re-running it is a no-op.
-- lib/server/migrations.ts ends a statement at a semicolon that closes a line,
-- and refuses dollar-quoted bodies rather than mis-splitting them.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS code_chunks (
  id           text        PRIMARY KEY,                -- <repo>/<path>#L<start>-L<end>
  repo         text        NOT NULL,
  path         text        NOT NULL,
  start_line   integer     NOT NULL CHECK (start_line >= 1),
  end_line     integer     NOT NULL CHECK (end_line >= start_line),
  commit_sha   text        NOT NULL CHECK (commit_sha ~ '^[0-9a-f]{40}$'),
  content      text        NOT NULL,                   -- header line + the lines verbatim
  content_hash text        NOT NULL,                   -- sha256(content): unchanged chunks are never re-embedded
  embedding    vector(768) NOT NULL,                   -- gemini-embedding-001 at outputDimensionality 768
  -- 'simple', not 'english': no stemming, so identifiers such as
  -- refreshAccessToken and useAuthStore stay searchable as written.
  tsv          tsvector    GENERATED ALWAYS AS (to_tsvector('simple', content)) STORED
);

-- Approximate nearest neighbour. At ~1.5k rows an exact scan is about as fast
-- (compared in data/rag-eval.json); the index is here for growth.
CREATE INDEX IF NOT EXISTS code_chunks_embedding_hnsw
  ON code_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS code_chunks_tsv_gin ON code_chunks USING gin (tsv);

CREATE INDEX IF NOT EXISTS code_chunks_repo_path ON code_chunks (repo, path);
