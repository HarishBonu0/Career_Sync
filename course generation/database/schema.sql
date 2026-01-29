-- Unfold Course Platform Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id VARCHAR(21) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'educator', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning Journeys Table
CREATE TABLE learning_journeys (
    id VARCHAR(21) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(550) UNIQUE NOT NULL,
    subtitle VARCHAR(500),
    description TEXT NOT NULL,
    who_is_for TEXT,
    who_is_not_for TEXT,
    published_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    start_date TIMESTAMP WITH TIME ZONE,
    creator_id VARCHAR(21) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thumbnail_url TEXT,
    enrollment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE courses (
    id VARCHAR(21) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(550) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    published_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    creator_id VARCHAR(21) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    journey_id VARCHAR(21) REFERENCES learning_journeys(id) ON DELETE SET NULL,
    thumbnail_url TEXT,
    enrollment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Topics Table
CREATE TABLE topics (
    id VARCHAR(21) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL
);

-- Course Topics (Many-to-Many)
CREATE TABLE course_topics (
    course_id VARCHAR(21) REFERENCES courses(id) ON DELETE CASCADE,
    topic_id VARCHAR(21) REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, topic_id)
);

-- Enrollments Table
CREATE TABLE enrollments (
    id VARCHAR(21) PRIMARY KEY,
    user_id VARCHAR(21) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(21) REFERENCES courses(id) ON DELETE CASCADE,
    journey_id VARCHAR(21) REFERENCES learning_journeys(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    CONSTRAINT enrollment_target CHECK (
        (course_id IS NOT NULL AND journey_id IS NULL) OR
        (course_id IS NULL AND journey_id IS NOT NULL)
    )
);

-- Educator Applications Table
CREATE TABLE educator_applications (
    id VARCHAR(21) PRIMARY KEY,
    user_id VARCHAR(21) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_journeys_slug ON learning_journeys(slug);
CREATE INDEX idx_journeys_creator ON learning_journeys(creator_id);
CREATE INDEX idx_journeys_published ON learning_journeys(published_date DESC);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_creator ON courses(creator_id);
CREATE INDEX idx_courses_journey ON courses(journey_id);
CREATE INDEX idx_courses_published ON courses(published_date DESC);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_journey ON enrollments(journey_id);
CREATE INDEX idx_course_topics_course ON course_topics(course_id);
CREATE INDEX idx_course_topics_topic ON course_topics(topic_id);

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journeys_updated_at BEFORE UPDATE ON learning_journeys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
