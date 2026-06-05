-- Phase 10.1: Content Monetisation Schema Extension

-- 1. Subscription Tiers defined by each Mistress
CREATE TABLE subscription_tiers (
    id SERIAL PRIMARY KEY,
    mistress_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_usd DECIMAL(10, 2) NOT NULL, -- monthly price
    price_credits INT NOT NULL,
    stripe_price_id VARCHAR(255), -- ID for Stripe recurring billing
    tier_level INT DEFAULT 1, -- higher level grants more access
    created_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- 2. active subscriptions
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    sub_id INT REFERENCES users(id) ON DELETE CASCADE,
    mistress_id INT REFERENCES users(id) ON DELETE CASCADE,
    tier_id INT REFERENCES subscription_tiers(id),
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, past_due
    stripe_subscription_id VARCHAR(255),
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT true
);

-- 3. Content Posts (Paywalled/PPV)
CREATE TABLE content_posts (
    id SERIAL PRIMARY KEY,
    mistress_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    caption TEXT,
    post_type VARCHAR(20) DEFAULT 'standard', -- standard, paywalled, ppv
    price_credits INT DEFAULT 0, -- price if PPV
    price_usd DECIMAL(10, 2) DEFAULT 0.00,
    required_tier_id INT REFERENCES subscription_tiers(id), -- access level requirement
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT false
);

-- 4. Post Media (S3 pointers)
CREATE TABLE content_media (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES content_posts(id) ON DELETE CASCADE,
    s3_key TEXT NOT NULL,
    media_type VARCHAR(20), -- image, video, audio
    preview_url TEXT, -- public low-res or 10s teaser
    is_protected BOOLEAN DEFAULT true
);

-- 5. Individual Purchase Access (PPV)
CREATE TABLE post_access (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    post_id INT REFERENCES content_posts(id) ON DELETE CASCADE,
    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    amount_paid DECIMAL(10, 2),
    UNIQUE(user_id, post_id)
);

-- 6. Indices for performance
CREATE INDEX idx_content_mistress ON content_posts(mistress_id);
CREATE INDEX idx_subs_user ON subscriptions(sub_id);
