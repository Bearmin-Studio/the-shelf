-- ============================================
-- The Shelf Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 2. GENRES TABLE
-- ============================================
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_genres_display_order ON genres(display_order);

-- ============================================
-- 3. FACTORIES TABLE
-- ============================================
CREATE TABLE factories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Basic info
    name TEXT NOT NULL,
    creator_name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    story TEXT,

    -- Classification
    genre_id INTEGER REFERENCES genres(id) ON DELETE SET NULL,

    -- Availability
    status TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'busy', 'inactive')),
    accepting_work BOOLEAN DEFAULT TRUE,

    -- Work capabilities
    work_types TEXT[] DEFAULT '{}',
    price_range TEXT,

    -- Theming
    color TEXT DEFAULT '#6366f1',
    accent TEXT DEFAULT '#818cf8',

    -- Social links (JSONB for flexibility)
    sns_links JSONB DEFAULT '[]',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_factories_user_id ON factories(user_id);
CREATE INDEX idx_factories_genre_id ON factories(genre_id);
CREATE INDEX idx_factories_status ON factories(status);
CREATE INDEX idx_factories_created_at ON factories(created_at DESC);

-- ============================================
-- 4. WORKS TABLE (Portfolio items)
-- ============================================
CREATE TABLE works (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    external_url TEXT,

    order_num INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_works_factory_id ON works(factory_id);
CREATE INDEX idx_works_order ON works(factory_id, order_num);

-- ============================================
-- 5. FEATURED_FACTORIES TABLE
-- ============================================
CREATE TABLE featured_factories (
    id SERIAL PRIMARY KEY,
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,

    month TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(factory_id, month)
);

CREATE INDEX idx_featured_factories_month ON featured_factories(month);
CREATE INDEX idx_featured_factories_priority ON featured_factories(month, priority);

-- ============================================
-- 6. OWNER_PICKS TABLE
-- ============================================
CREATE TABLE owner_picks (
    id SERIAL PRIMARY KEY,
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,

    comment TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(factory_id)
);

CREATE INDEX idx_owner_picks_active ON owner_picks(is_active, order_num);

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_factories_updated_at
    BEFORE UPDATE ON factories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_works_updated_at
    BEFORE UPDATE ON works
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_owner_picks_updated_at
    BEFORE UPDATE ON owner_picks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
