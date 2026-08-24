CREATE TABLE IF NOT EXISTS investigation_sessions (
    session_id UUID PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investigation_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES investigation_sessions(session_id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('investigator', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investigation_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES investigation_sessions(session_id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    clarified_query TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    depth_reached INTEGER,
    result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS investigation_findings (
    finding_id VARCHAR(255) NOT NULL,
    run_id UUID NOT NULL REFERENCES investigation_runs(run_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    entity_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    relationship_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0,
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (run_id, finding_id)
);

CREATE INDEX IF NOT EXISTS investigation_messages_session_idx ON investigation_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS investigation_runs_session_idx ON investigation_runs(session_id, created_at);
CREATE INDEX IF NOT EXISTS investigation_findings_run_idx ON investigation_findings(run_id);
