-- ==============================================================================
-- AGROSHIELD DATABASE SCHEMA
-- Version: 1.0.0
-- Target: PostgreSQL 14+ with pgvector, uuid-ossp, and pg_trgm extensions
-- Description: Complete persistent relational and vector schema for AgroShield
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- MODULE 1: USER & FARM MANAGEMENT
-- ==============================================================================

-- Core application users (farmers and agricultural officers)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'hi', -- 'hi', 'en', 'mr', 'gu', etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Extended farmer profile containing regional and geographic coordinates
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    sub_district VARCHAR(50),
    village VARCHAR(100) NOT NULL,
    pin_code VARCHAR(10),
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    experience_years INT CHECK (experience_years >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_farmer_profile_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_farmer_profiles_location ON farmer_profiles (state, district);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_coords ON farmer_profiles (latitude, longitude);

DROP TRIGGER IF EXISTS trg_farmer_profiles_updated_at ON farmer_profiles;
CREATE TRIGGER trg_farmer_profiles_updated_at
BEFORE UPDATE ON farmer_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Farm holdings (a farmer can have multiple farm plots)
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_profile_id UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    farm_name VARCHAR(100) NOT NULL,
    area_acres NUMERIC(6, 2) NOT NULL CHECK (area_acres > 0),
    soil_type VARCHAR(50), -- 'Black Soil', 'Alluvial Soil', 'Red Soil', 'Clay Loam', etc.
    irrigation_source VARCHAR(50), -- 'Borewell', 'Canal', 'Drip', 'Rainfed', 'Sprinkler'
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_farms_farmer_profile ON farms(farmer_profile_id);

DROP TRIGGER IF EXISTS trg_farms_updated_at ON farms;
CREATE TRIGGER trg_farms_updated_at
BEFORE UPDATE ON farms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verified reference catalog of agricultural crops in India
CREATE TABLE IF NOT EXISTS crop_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    common_name VARCHAR(50) UNIQUE NOT NULL, -- 'Cotton', 'Wheat', 'Soybean', 'Rice'
    hindi_name VARCHAR(50) NOT NULL,        -- 'कपास', 'गेहूं', 'सोयाबीन', 'धान'
    scientific_name VARCHAR(100),
    crop_category VARCHAR(30) NOT NULL,     -- 'Cash Crop', 'Cereal', 'Oilseed', 'Pulse'
    season VARCHAR(20) NOT NULL,            -- 'Kharif', 'Rabi', 'Zaid'
    standard_duration_days INT NOT NULL CHECK (standard_duration_days > 0),
    min_temp_c NUMERIC(4, 1),
    max_temp_c NUMERIC(4, 1),
    optimal_rainfall_mm_min NUMERIC(6, 1),
    optimal_rainfall_mm_max NUMERIC(6, 1),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Crop growth stages mapping phenological timeline
CREATE TABLE IF NOT EXISTS crop_growth_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_id UUID NOT NULL REFERENCES crop_catalog(id) ON DELETE CASCADE,
    stage_name VARCHAR(50) NOT NULL,         -- 'Sowing', 'Vegetative', 'Flowering', 'Boll Formation', 'Maturity'
    stage_order INT NOT NULL CHECK (stage_order > 0),
    start_day_offset INT NOT NULL CHECK (start_day_offset >= 0),
    end_day_offset INT NOT NULL CHECK (end_day_offset >= start_day_offset),
    water_sensitivity VARCHAR(20) NOT NULL,  -- 'Low', 'Moderate', 'Critical', 'High'
    heat_sensitivity VARCHAR(20) NOT NULL,   -- 'Low', 'Moderate', 'Critical', 'High'
    key_vulnerabilities TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_crop_stage UNIQUE (crop_id, stage_order)
);

CREATE INDEX IF NOT EXISTS idx_crop_growth_stages_crop ON crop_growth_stages(crop_id);

-- Active crop cultivated on a specific farm
CREATE TABLE IF NOT EXISTS farm_crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES crop_catalog(id) ON DELETE RESTRICT,
    variety_name VARCHAR(100),
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    current_growth_stage_id UUID REFERENCES crop_growth_stages(id) ON DELETE SET NULL,
    current_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (current_status IN ('ACTIVE', 'HARVESTED', 'FAILED', 'PLANNED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_farm_crops_farm ON farm_crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_crops_status ON farm_crops(current_status);

DROP TRIGGER IF EXISTS trg_farm_crops_updated_at ON farm_crops;
CREATE TRIGGER trg_farm_crops_updated_at
BEFORE UPDATE ON farm_crops
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- MODULE 2: DATA SOURCE REGISTRY & EXTERNAL DATA INTELLIGENCE
-- ==============================================================================

-- Registry of verified external APIs and documentation sources (for strict provenance)
CREATE TABLE IF NOT EXISTS data_source_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(100) UNIQUE NOT NULL, -- 'Open-Meteo Weather API', 'data.gov.in AGMARKNET', 'ICAR Advisories'
    source_type VARCHAR(30) NOT NULL,         -- 'WEATHER_API', 'MANDI_API', 'OFFICIAL_DOCUMENT', 'RESEARCH_PAPER'
    endpoint_or_url TEXT NOT NULL,
    authentication_type VARCHAR(30) DEFAULT 'NONE', -- 'NONE', 'API_KEY', 'BEARER_TOKEN'
    is_active BOOLEAN DEFAULT TRUE,
    attribution_text TEXT NOT NULL,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Actual fetched weather observations (retains source & timestamps)
CREATE TABLE IF NOT EXISTS weather_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    source_id UUID NOT NULL REFERENCES data_source_registry(id) ON DELETE RESTRICT,
    observation_timestamp TIMESTAMPTZ NOT NULL,
    temperature_c NUMERIC(4, 1) NOT NULL,
    relative_humidity_pct NUMERIC(4, 1),
    precipitation_mm NUMERIC(6, 2) DEFAULT 0.0,
    wind_speed_kmh NUMERIC(5, 2),
    wind_direction_deg INT,
    weather_code INT,
    weather_description VARCHAR(100),
    raw_response JSONB,
    fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weather_obs_coords_time ON weather_observations(latitude, longitude, observation_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_weather_obs_farm ON weather_observations(farm_id);

-- Actual fetched hourly and daily weather forecasts
CREATE TABLE IF NOT EXISTS weather_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    source_id UUID NOT NULL REFERENCES data_source_registry(id) ON DELETE RESTRICT,
    forecast_date DATE NOT NULL,
    temp_min_c NUMERIC(4, 1) NOT NULL,
    temp_max_c NUMERIC(4, 1) NOT NULL,
    precipitation_sum_mm NUMERIC(6, 2) NOT NULL,
    precipitation_probability_pct INT,
    max_wind_speed_kmh NUMERIC(5, 2),
    evapotranspiration_mm NUMERIC(5, 2),
    uv_index_max NUMERIC(4, 1),
    weather_code INT,
    raw_response JSONB,
    fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_weather_forecast UNIQUE (latitude, longitude, forecast_date, source_id)
);

CREATE INDEX IF NOT EXISTS idx_weather_forecast_date ON weather_forecasts(latitude, longitude, forecast_date);

-- Verified agricultural produce market (mandi) directory
CREATE TABLE IF NOT EXISTS mandi_markets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_name VARCHAR(100) NOT NULL,
    district VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_mandi_location UNIQUE (market_name, district, state)
);

CREATE INDEX IF NOT EXISTS idx_mandi_markets_state_dist ON mandi_markets(state, district);

-- Actual daily agricultural commodity market prices
CREATE TABLE IF NOT EXISTS mandi_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_id UUID NOT NULL REFERENCES mandi_markets(id) ON DELETE CASCADE,
    commodity VARCHAR(50) NOT NULL,
    variety VARCHAR(50),
    arrival_date DATE NOT NULL,
    min_price NUMERIC(10, 2) NOT NULL CHECK (min_price >= 0),
    max_price NUMERIC(10, 2) NOT NULL CHECK (max_price >= min_price),
    modal_price NUMERIC(10, 2) NOT NULL CHECK (modal_price >= min_price AND modal_price <= max_price),
    unit VARCHAR(20) DEFAULT 'Rs/Quintal',
    source_id UUID NOT NULL REFERENCES data_source_registry(id) ON DELETE RESTRICT,
    fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_mandi_price_record UNIQUE (market_id, commodity, variety, arrival_date)
);

CREATE INDEX IF NOT EXISTS idx_mandi_prices_lookup ON mandi_prices(commodity, arrival_date DESC);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_market ON mandi_prices(market_id, arrival_date DESC);

-- ==============================================================================
-- MODULE 3: AGRICULTURAL RAG & VECTOR KNOWLEDGE BASE
-- ==============================================================================

-- Verified official agricultural research papers, advisories and publications
CREATE TABLE IF NOT EXISTS agricultural_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    issuing_institution VARCHAR(150) NOT NULL, -- e.g., 'ICAR - Central Institute for Cotton Research', 'TNAU'
    document_type VARCHAR(50) NOT NULL,        -- 'PACKAGE_OF_PRACTICES', 'PEST_ADVISORY', 'IRRIGATION_GUIDE'
    publication_year INT,
    source_url TEXT,
    document_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA256 of the original file
    total_chunks INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Semantic chunks extracted from documents
CREATE TABLE IF NOT EXISTS agricultural_document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES agricultural_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    clean_text TEXT NOT NULL,
    page_number INT,
    crop_name VARCHAR(50),
    growth_stage VARCHAR(50),
    topic VARCHAR(50),                         -- 'Disease Management', 'Irrigation', 'Fertilization', 'Pest Control'
    region VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_document_chunk UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_doc_chunks_filters ON agricultural_document_chunks(crop_name, growth_stage, topic);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_text_trgm ON agricultural_document_chunks USING gin (clean_text gin_trgm_ops);

-- Dense vector embeddings generated locally via Sentence Transformers (384-dim: all-MiniLM-L6-v2)
CREATE TABLE IF NOT EXISTS document_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chunk_id UUID UNIQUE NOT NULL REFERENCES agricultural_document_chunks(id) ON DELETE CASCADE,
    embedding vector(384) NOT NULL,
    model_name VARCHAR(100) DEFAULT 'sentence-transformers/all-MiniLM-L6-v2',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Vector HNSW index for sub-millisecond cosine distance nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_document_embeddings_vector 
ON document_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ==============================================================================
-- MODULE 4: AGENTIC AI, CONVERSATIONS & EXECUTION TRACES
-- ==============================================================================

-- Farmer chat conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    title VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, updated_at DESC);

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON conversations;
CREATE TRIGGER trg_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Messages exchanged within a conversation
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    input_modality VARCHAR(20) DEFAULT 'text' CHECK (input_modality IN ('text', 'voice', 'image')),
    language VARCHAR(10) DEFAULT 'hi',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON conversation_messages(conversation_id, created_at ASC);

-- Traceable record of an autonomous agent execution lifecycle
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_message_id UUID REFERENCES conversation_messages(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'INITIALIZED' CHECK (status IN ('INITIALIZED', 'PLANNING', 'EXECUTING_TOOLS', 'SYNTHESIZING', 'COMPLETED', 'FAILED', 'DEGRADED')),
    error_message TEXT,
    total_tokens INT DEFAULT 0,
    latency_ms INT,
    model_used VARCHAR(50),
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_conversation ON agent_runs(conversation_id);

-- Real-time audit log of each reasoning/execution step inside the agent run
CREATE TABLE IF NOT EXISTS agent_execution_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    step_name VARCHAR(100) NOT NULL, -- 'Understand Query', 'Fetch Farm Context', 'Retrieve Weather', 'Calculate Risk', 'RAG Retrieval', 'Format Advisory'
    status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING', 'RUNNING', 'SUCCESS', 'SKIPPED', 'FAILED')),
    summary TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    latency_ms INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_steps_run ON agent_execution_steps(agent_run_id, step_order ASC);

-- Granular telemetry of every tool invocation performed by the agent
CREATE TABLE IF NOT EXISTS tool_execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    input_payload JSONB,
    output_payload JSONB,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'TIMEOUT', 'FALLBACK')),
    latency_ms INT NOT NULL,
    retry_count INT DEFAULT 0,
    error_details TEXT,
    executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tool_logs_run ON tool_execution_logs(agent_run_id);

-- ==============================================================================
-- MODULE 5: DETERMINISTIC CROP RISK & ADVISORIES
-- ==============================================================================

-- Configurable domain rules derived from ICAR / Agronomy thresholds
CREATE TABLE IF NOT EXISTS risk_rule_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_code VARCHAR(50) UNIQUE NOT NULL,      -- 'COTTON_FLOWERING_RAIN_HEAVY', 'WHEAT_GRAIN_HEAT_STRESS'
    crop_id UUID REFERENCES crop_catalog(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES crop_growth_stages(id) ON DELETE CASCADE,
    condition_metric VARCHAR(50) NOT NULL,     -- 'precipitation_sum_mm', 'temp_max_c', 'relative_humidity_pct'
    operator VARCHAR(10) NOT NULL CHECK (operator IN ('>', '>=', '<', '<=', 'BETWEEN')),
    threshold_value_min NUMERIC(8, 2),
    threshold_value_max NUMERIC(8, 2),
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('LOW', 'MODERATE', 'HIGH', 'SEVERE')),
    rationale TEXT NOT NULL,
    source_citation TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Crop risk assessment records generated by the deterministic engine
CREATE TABLE IF NOT EXISTS crop_risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_crop_id UUID NOT NULL REFERENCES farm_crops(id) ON DELETE CASCADE,
    agent_run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'SEVERE')),
    risk_score NUMERIC(5, 2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    primary_factors JSONB NOT NULL,            -- Array of triggered rules and observed values
    calculated_conditions JSONB NOT NULL,      -- Evaluated environmental variables
    raw_metrics JSONB,                         -- Weather & soil snapshot used in calculation
    limitations TEXT,                          -- Data gaps or caveats noted
    assessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_crop ON crop_risk_assessments(farm_crop_id, assessed_at DESC);

-- Formal advisories generated for the farmer
CREATE TABLE IF NOT EXISTS advisories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_crop_id UUID NOT NULL REFERENCES farm_crops(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    agent_run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
    risk_assessment_id UUID REFERENCES crop_risk_assessments(id) ON DELETE SET NULL,
    language VARCHAR(10) DEFAULT 'hi',
    title VARCHAR(200) NOT NULL,
    summary TEXT NOT NULL,
    detailed_steps JSONB NOT NULL,             -- Array of actionable steps (Immediate, Preventative, Monitoring)
    urgency VARCHAR(20) DEFAULT 'NORMAL' CHECK (urgency IN ('INFO', 'NORMAL', 'URGENT', 'CRITICAL')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_advisories_crop ON advisories(farm_crop_id, created_at DESC);

-- Provenance links connecting advisories directly to verified RAG knowledge chunks
CREATE TABLE IF NOT EXISTS advisory_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisory_id UUID NOT NULL REFERENCES advisories(id) ON DELETE CASCADE,
    document_chunk_id UUID NOT NULL REFERENCES agricultural_document_chunks(id) ON DELETE RESTRICT,
    cited_text_snippet TEXT NOT NULL,
    similarity_score NUMERIC(4, 3),
    page_number INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_advisory_citations_adv ON advisory_citations(advisory_id);

-- Counterfactual scenario simulations (e.g. +50mm rain, +4 deg C temperature)
CREATE TABLE IF NOT EXISTS scenario_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_crop_id UUID NOT NULL REFERENCES farm_crops(id) ON DELETE CASCADE,
    base_assessment_id UUID NOT NULL REFERENCES crop_risk_assessments(id) ON DELETE RESTRICT,
    simulated_delta JSONB NOT NULL,            -- e.g. {"rain_delta_mm": 40, "temp_max_delta_c": 3}
    scenario_risk_level VARCHAR(20) NOT NULL,
    scenario_risk_score NUMERIC(5, 2) NOT NULL,
    comparison_summary TEXT NOT NULL,
    preventative_advice TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scenarios_crop ON scenario_analyses(farm_crop_id);

-- ==============================================================================
-- MODULE 6: MULTIMODAL CROP INSPECTION & VOICE METADATA
-- ==============================================================================

-- Storage reference of crop health photos uploaded by the farmer
CREATE TABLE IF NOT EXISTS crop_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_crop_id UUID REFERENCES farm_crops(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,                -- Local path or object store URL
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes INT NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crop_images_user ON crop_images(user_id);

-- Multimodal AI analysis results from Gemini Vision
CREATE TABLE IF NOT EXISTS image_analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id UUID NOT NULL REFERENCES crop_images(id) ON DELETE CASCADE,
    agent_run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
    detected_symptoms JSONB NOT NULL,          -- Array of visible abnormalities (leaf curling, yellowing, spots)
    possible_causes JSONB NOT NULL,            -- Array of potential diagnoses with likelihoods
    confidence_level VARCHAR(20) NOT NULL,     -- 'LOW', 'MODERATE', 'HIGH'
    recommended_actions JSONB NOT NULL,        -- Immediate precautionary agricultural steps
    uncertainty_disclaimer TEXT NOT NULL,      -- Mandatory legal/agricultural notice advising expert confirmation
    analyzed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_image_analysis_image ON image_analysis_results(image_id);

-- Voice query metadata for accessibility tracking
CREATE TABLE IF NOT EXISTS voice_interaction_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,
    duration_seconds NUMERIC(5, 2),
    transcription_engine VARCHAR(50) DEFAULT 'WebSpeechAPI',
    detected_language VARCHAR(20),
    confidence_score NUMERIC(4, 3),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- MODULE 7: FARMER MEMORY, FEEDBACK & PROACTIVE ALERTS
-- ==============================================================================

-- Persistent semantic memory items extracted across farmer interactions
CREATE TABLE IF NOT EXISTS farmer_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    memory_key VARCHAR(100) NOT NULL,          -- 'preferred_fertilizer_type', 'past_pest_infestation', 'water_scarcity_issue'
    memory_value TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,             -- 'FARMING_PRACTICE', 'HISTORICAL_PROBLEM', 'PREFERENCE'
    confidence_score NUMERIC(4, 2) DEFAULT 1.0,
    last_validated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_farmer_memory_key UNIQUE (user_id, memory_key)
);

CREATE INDEX IF NOT EXISTS idx_farmer_memory_user ON farmer_memory(user_id);

-- Farmer feedback to close the continuous evaluation loop
CREATE TABLE IF NOT EXISTS farmer_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisory_id UUID NOT NULL REFERENCES advisories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    was_helpful BOOLEAN NOT NULL,
    feedback_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Proactive system alerts triggered by scheduled background jobs
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_crop_id UUID REFERENCES farm_crops(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,           -- 'WEATHER_WARNING', 'CROP_RISK_SURGE', 'STAGE_TRANSITION'
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_unread ON alerts(user_id, is_read, created_at DESC);

-- Notification preferences per farmer
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    high_risk_immediate BOOLEAN DEFAULT TRUE,
    mandi_price_alerts BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- MODULE 8: SYSTEM OPERATIONS & SCHEDULING TELEMETRY
-- ==============================================================================

-- Telemetry log of outbound API requests (for rate-limit detection and health checks)
CREATE TABLE IF NOT EXISTS api_request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) NOT NULL,        -- 'Open-Meteo', 'data.gov.in', 'Gemini Free API'
    endpoint TEXT NOT NULL,
    status_code INT,
    latency_ms INT,
    error_message TEXT,
    request_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_logs_service_time ON api_request_logs(service_name, request_timestamp DESC);

-- Background cron/scheduled job execution records
CREATE TABLE IF NOT EXISTS scheduled_job_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_name VARCHAR(100) NOT NULL,            -- 'PROACTIVE_WEATHER_RISK_CHECK', 'MANDI_PRICE_SYNC'
    status VARCHAR(20) NOT NULL CHECK (status IN ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL')),
    target_count INT DEFAULT 0,
    processed_count INT DEFAULT 0,
    error_log TEXT,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_job_runs_job ON scheduled_job_runs(job_name, started_at DESC);

-- ==============================================================================
-- MODULE 9: VERIFIED REFERENCE DATA SEEDING (NO MOCK USER DATA)
-- Only verified agronomic constants from ICAR / Government agronomy records
-- ==============================================================================

-- 9.1 Data Sources
INSERT INTO data_source_registry (source_name, source_type, endpoint_or_url, authentication_type, attribution_text)
VALUES
('Open-Meteo Weather API', 'WEATHER_API', 'https://api.open-meteo.com/v1/forecast', 'NONE', 'Weather data provided by Open-Meteo (open-meteo.com) under CC BY 4.0'),
('Open-Meteo Archive API', 'WEATHER_API', 'https://archive-api.open-meteo.com/v1/archive', 'NONE', 'Historical weather data provided by Open-Meteo'),
('Open Government Data Platform India (data.gov.in)', 'MANDI_API', 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070', 'API_KEY', 'Mandi market prices sourced from data.gov.in / AGMARKNET Directorate of Marketing & Inspection'),
('ICAR - All India Coordinated Research Projects', 'OFFICIAL_DOCUMENT', 'https://icar.org.in', 'NONE', 'Official agricultural package of practices and crop advisories by ICAR')
ON CONFLICT (source_name) DO NOTHING;

-- 9.2 Standard Indian Crops Catalog
INSERT INTO crop_catalog (common_name, hindi_name, scientific_name, crop_category, season, standard_duration_days, min_temp_c, max_temp_c, optimal_rainfall_mm_min, optimal_rainfall_mm_max)
VALUES
('Cotton', 'कपास', 'Gossypium hirsutum', 'Cash Crop', 'Kharif', 160, 21.0, 35.0, 500.0, 800.0),
('Wheat', 'गेहूं', 'Triticum aestivum', 'Cereal', 'Rabi', 130, 10.0, 25.0, 300.0, 450.0),
('Soybean', 'सोयाबीन', 'Glycine max', 'Oilseed', 'Kharif', 105, 20.0, 32.0, 600.0, 900.0),
('Rice (Paddy)', 'धान / चावल', 'Oryza sativa', 'Cereal', 'Kharif', 135, 20.0, 38.0, 1000.0, 1500.0),
('Mustard', 'सरसों', 'Brassica juncea', 'Oilseed', 'Rabi', 115, 10.0, 25.0, 250.0, 400.0),
('Maize', 'मक्का', 'Zea mays', 'Cereal', 'Kharif', 100, 18.0, 32.0, 500.0, 750.0),
('Chickpea (Gram)', 'चना', 'Cicer arietinum', 'Pulse', 'Rabi', 110, 12.0, 28.0, 200.0, 350.0)
ON CONFLICT (common_name) DO NOTHING;

-- 9.3 Growth Stages for Cotton (Sample verified phenology)
DO $$
DECLARE
    cotton_id UUID;
    wheat_id UUID;
BEGIN
    SELECT id INTO cotton_id FROM crop_catalog WHERE common_name = 'Cotton';
    IF cotton_id IS NOT NULL THEN
        INSERT INTO crop_growth_stages (crop_id, stage_name, stage_order, start_day_offset, end_day_offset, water_sensitivity, heat_sensitivity, key_vulnerabilities)
        VALUES
        (cotton_id, 'Germination & Seedling', 1, 0, 25, 'Moderate', 'Moderate', 'Crust formation, damping-off, cutworms'),
        (cotton_id, 'Squaring (Vegetative to Bud)', 2, 26, 50, 'Moderate', 'Low', 'Aphids, jassids, thrips, moisture stress leading to square drop'),
        (cotton_id, 'Flowering & Boll Formation', 3, 51, 100, 'Critical', 'Critical', 'Waterlogging causes flower and young boll shedding; heavy rain washes pollen'),
        (cotton_id, 'Boll Opening', 4, 101, 140, 'Low', 'Moderate', 'Rain discolors lint; boll rot, bollworms'),
        (cotton_id, 'Maturity & Picking', 5, 141, 175, 'Low', 'Low', 'Rain damages open cotton bolls causing fiber degradation')
        ON CONFLICT (crop_id, stage_order) DO NOTHING;
    END IF;

    SELECT id INTO wheat_id FROM crop_catalog WHERE common_name = 'Wheat';
    IF wheat_id IS NOT NULL THEN
        INSERT INTO crop_growth_stages (crop_id, stage_name, stage_order, start_day_offset, end_day_offset, water_sensitivity, heat_sensitivity, key_vulnerabilities)
        VALUES
        (wheat_id, 'Crown Root Initiation (CRI)', 1, 0, 25, 'Critical', 'Low', 'Moisture deficit drastically reduces tillering'),
        (wheat_id, 'Tillering', 2, 26, 45, 'Moderate', 'Low', 'Nitrogen deficiency, moisture stress'),
        (wheat_id, 'Jointing & Booting', 3, 46, 75, 'High', 'Moderate', 'Stripe rust, stem lodging from high winds'),
        (wheat_id, 'Flowering & Grain Filling', 4, 76, 105, 'Critical', 'Critical', 'Terminal heat stress above 30C causes grain shriveling'),
        (wheat_id, 'Dough & Maturity', 5, 106, 130, 'Low', 'Low', 'Unseasonal rainfall causes grain discoloration and lodging')
        ON CONFLICT (crop_id, stage_order) DO NOTHING;
    END IF;
END $$;

-- 9.4 Deterministic Risk Rules (Agronomically validated thresholds)
DO $$
DECLARE
    cotton_id UUID;
    cotton_flowering_id UUID;
    wheat_id UUID;
    wheat_grain_id UUID;
BEGIN
    SELECT id INTO cotton_id FROM crop_catalog WHERE common_name = 'Cotton';
    SELECT id INTO wheat_id FROM crop_catalog WHERE common_name = 'Wheat';

    IF cotton_id IS NOT NULL THEN
        SELECT id INTO cotton_flowering_id FROM crop_growth_stages WHERE crop_id = cotton_id AND stage_name = 'Flowering & Boll Formation';
        
        IF cotton_flowering_id IS NOT NULL THEN
            INSERT INTO risk_rule_definitions (rule_code, crop_id, stage_id, condition_metric, operator, threshold_value_min, threshold_value_max, severity_level, rationale, source_citation)
            VALUES
            ('COTTON_FLOWERING_RAIN_HEAVY', cotton_id, cotton_flowering_id, 'precipitation_sum_mm', '>=', 35.0, NULL, 'HIGH', 
             'Heavy precipitation during flowering washes away viable pollen and leads to extensive square and young boll shedding.',
             'ICAR-CICR Nagpur: Integrated Pest & Crop Management in Cotton, Technical Bulletin No. 42')
            ON CONFLICT (rule_code) DO NOTHING;

            INSERT INTO risk_rule_definitions (rule_code, crop_id, stage_id, condition_metric, operator, threshold_value_min, threshold_value_max, severity_level, rationale, source_citation)
            VALUES
            ('COTTON_FLOWERING_HUMIDITY_PEST', cotton_id, cotton_flowering_id, 'relative_humidity_pct', '>=', 80.0, NULL, 'MODERATE', 
             'Continuous high relative humidity above 80% accompanied by warm weather promotes grey mildew, bacterial blight, and sucking pest proliferation.',
             'TNAU Agritech Portal: Cotton Crop Protection Guidance')
            ON CONFLICT (rule_code) DO NOTHING;
        END IF;
    END IF;

    IF wheat_id IS NOT NULL THEN
        SELECT id INTO wheat_grain_id FROM crop_growth_stages WHERE crop_id = wheat_id AND stage_name = 'Flowering & Grain Filling';

        IF wheat_grain_id IS NOT NULL THEN
            INSERT INTO risk_rule_definitions (rule_code, crop_id, stage_id, condition_metric, operator, threshold_value_min, threshold_value_max, severity_level, rationale, source_citation)
            VALUES
            ('WHEAT_GRAIN_TERMINAL_HEAT', wheat_id, wheat_grain_id, 'temp_max_c', '>=', 32.0, NULL, 'SEVERE', 
             'Terminal heat stress exceeding 32 deg C during grain filling impairs starch synthesis enzymes, prematurely halting dry matter accumulation and resulting in shrivelled grains.',
             'ICAR-IIWBR Karnal: Climate-Resilient Wheat Production in India, Advisory Bulletin')
            ON CONFLICT (rule_code) DO NOTHING;
        END IF;
    END IF;
END $$;
