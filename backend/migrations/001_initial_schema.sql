CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
    post_id BIGSERIAL PRIMARY KEY,
    poster_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body VARCHAR(300) NOT NULL,
    category CHAR(1) NOT NULL CHECK (category IN ('G', 'F', 'M')),
    image_url TEXT NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
    reply_count INTEGER NOT NULL DEFAULT 0 CHECK (reply_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE replies (
    reply_id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    replier_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    body VARCHAR(300) NOT NULL,
    image_url TEXT,
    like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE likes (
    like_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES posts(post_id) ON DELETE CASCADE,
    reply_id BIGINT REFERENCES replies(reply_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT likes_exactly_one_target CHECK (num_nonnulls(post_id, reply_id) = 1),
    CONSTRAINT likes_user_post_unique UNIQUE (user_id, post_id),
    CONSTRAINT likes_user_reply_unique UNIQUE (user_id, reply_id)
);

CREATE TABLE follows (
    follower_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    followee_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, followee_id),
    CONSTRAINT follows_different_users CHECK (follower_id <> followee_id)
);

CREATE INDEX posts_created_at_index ON posts (created_at DESC);
CREATE INDEX posts_poster_id_index ON posts (poster_id);
CREATE INDEX posts_category_index ON posts (category);
CREATE INDEX replies_post_id_created_at_index ON replies (post_id, created_at);
CREATE INDEX follows_followee_id_index ON follows (followee_id);

