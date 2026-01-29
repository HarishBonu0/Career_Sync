-- Sample Data for Unfold Platform

-- Insert Topics (30+ topics)
INSERT INTO topics (id, name, slug) VALUES
('topic-1', 'Python', 'python'),
('topic-2', 'JavaScript', 'javascript'),
('topic-3', 'UI/UX Design', 'ui-ux-design'),
('topic-4', 'Quantum Mechanics', 'quantum-mechanics'),
('topic-5', 'Italian', 'italian'),
('topic-6', 'Data Science', 'data-science'),
('topic-7', 'Machine Learning', 'machine-learning'),
('topic-8', 'Web Development', 'web-development'),
('topic-9', 'Mobile Development', 'mobile-development'),
('topic-10', 'DevOps', 'devops'),
('topic-11', 'Cloud Computing', 'cloud-computing'),
('topic-12', 'Blockchain', 'blockchain'),
('topic-13', 'Cybersecurity', 'cybersecurity'),
('topic-14', 'AI Ethics', 'ai-ethics'),
('topic-15', 'Digital Marketing', 'digital-marketing'),
('topic-16', 'Content Writing', 'content-writing'),
('topic-17', 'Photography', 'photography'),
('topic-18', 'Video Editing', 'video-editing'),
('topic-19', 'Music Production', 'music-production'),
('topic-20', 'Graphic Design', 'graphic-design'),
('topic-21', 'Business Strategy', 'business-strategy'),
('topic-22', 'Finance', 'finance'),
('topic-23', 'Economics', 'economics'),
('topic-24', 'Psychology', 'psychology'),
('topic-25', 'Philosophy', 'philosophy'),
('topic-26', 'History', 'history'),
('topic-27', 'Biology', 'biology'),
('topic-28', 'Chemistry', 'chemistry'),
('topic-29', 'Physics', 'physics'),
('topic-30', 'Mathematics', 'mathematics'),
('topic-31', 'Statistics', 'statistics'),
('topic-32', 'Public Speaking', 'public-speaking');

-- Insert Sample Users
-- Password for all users: password123
-- Hash: $2a$10$rXj8K5qKZYYgLmXmKvRJ0.9Z9V5YqW5cZ4LxBqKXqZYYgLmXmKvRJ0
INSERT INTO users (id, email, name, password_hash, role) VALUES
('user-1', 'learner@example.com', 'John Learner', '$2a$10$rXj8K5qKZYYgLmXmKvRJ0.9Z9V5YqW5cZ4LxBqKXqZYYgLmXmKvRJ0', 'learner'),
('user-2', 'educator@example.com', 'Jane Educator', '$2a$10$rXj8K5qKZYYgLmXmKvRJ0.9Z9V5YqW5cZ4LxBqKXqZYYgLmXmKvRJ0', 'educator'),
('user-3', 'admin@example.com', 'Admin User', '$2a$10$rXj8K5qKZYYgLmXmKvRJ0.9Z9V5YqW5cZ4LxBqKXqZYYgLmXmKvRJ0', 'admin'),
('user-4', 'sarah@example.com', 'Sarah Smith', '$2a$10$rXj8K5qKZYYgLmXmKvRJ0.9Z9V5YqW5cZ4LxBqKXqZYYgLmXmKvRJ0', 'educator');

-- Insert Learning Journeys
INSERT INTO learning_journeys (id, title, slug, subtitle, description, who_is_for, who_is_not_for, published_date, start_date, creator_id) VALUES
('journey-1', 'Full Stack Web Development Mastery', 'full-stack-web-development-mastery', 'From Zero to Hero in Modern Web Development', 
'Master the complete web development stack including HTML, CSS, JavaScript, React, Node.js, and databases. Build real-world projects and deploy them to production.',
'This journey is perfect for beginners who want to become professional web developers, career changers looking to enter tech, and developers who want to update their skills.',
'This is not for those looking for quick shortcuts or those who already have extensive full-stack experience.',
'2025-12-29', '2026-01-15', 'user-2'),

('journey-2', 'Data Science & Machine Learning Path', 'data-science-ml-path', 'Transform Data into Insights',
'Learn Python, statistics, data analysis, visualization, and machine learning. Work on real datasets and build predictive models.',
'Ideal for aspiring data scientists, analysts wanting to level up, and developers interested in AI/ML.',
'Not suitable for those without basic programming knowledge or strong math phobia.',
'2025-12-28', '2026-01-20', 'user-2'),

('journey-3', 'UI/UX Design Professional', 'ui-ux-design-professional', 'Design Beautiful and Functional Experiences',
'Master user research, wireframing, prototyping, visual design, and usability testing. Learn industry-standard tools like Figma and Adobe XD.',
'Perfect for aspiring designers, developers wanting to improve design skills, and career switchers.',
'Not for those looking only for graphic design or illustration skills.',
'2025-12-27', '2026-02-01', 'user-4');

-- Insert Courses
INSERT INTO courses (id, title, slug, description, published_date, creator_id, journey_id) VALUES
('course-1', 'Python for Beginners - Complete Guide', 'python-for-beginners-complete-guide',
'Learn Python from scratch. Master variables, functions, loops, OOP, and more. Build real projects.',
'2025-12-20', 'user-2', 'journey-2'),

('course-2', 'JavaScript Fundamentals', 'javascript-fundamentals',
'Master modern JavaScript ES6+. Learn variables, functions, async programming, and DOM manipulation.',
'2025-12-18', 'user-2', 'journey-1'),

('course-3', 'React - Building Modern UIs', 'react-building-modern-uis',
'Build dynamic user interfaces with React. Learn hooks, state management, routing, and best practices.',
'2025-12-15', 'user-2', 'journey-1'),

('course-4', 'Figma for UI Design', 'figma-for-ui-design',
'Master Figma from basics to advanced. Create wireframes, prototypes, and design systems.',
'2025-12-10', 'user-4', 'journey-3'),

('course-5', 'Node.js Backend Development', 'nodejs-backend-development',
'Build scalable backend APIs with Node.js and Express. Learn authentication, databases, and deployment.',
'2025-12-08', 'user-2', 'journey-1'),

('course-6', 'Data Analysis with Python', 'data-analysis-with-python',
'Learn pandas, numpy, and matplotlib. Analyze real-world datasets and create stunning visualizations.',
'2025-12-05', 'user-2', 'journey-2');

-- Link courses to topics
INSERT INTO course_topics (course_id, topic_id) VALUES
('course-1', 'topic-1'),
('course-1', 'topic-6'),
('course-2', 'topic-2'),
('course-2', 'topic-8'),
('course-3', 'topic-2'),
('course-3', 'topic-8'),
('course-4', 'topic-3'),
('course-4', 'topic-20'),
('course-5', 'topic-2'),
('course-5', 'topic-8'),
('course-6', 'topic-1'),
('course-6', 'topic-6');

-- Insert sample enrollments
INSERT INTO enrollments (id, user_id, journey_id, enrolled_at, progress) VALUES
('enroll-1', 'user-1', 'journey-1', '2025-12-25', 45),
('enroll-2', 'user-1', 'journey-2', '2025-12-26', 20);

INSERT INTO enrollments (id, user_id, course_id, enrolled_at, progress) VALUES
('enroll-3', 'user-1', 'course-1', '2025-12-27', 75),
('enroll-4', 'user-1', 'course-2', '2025-12-28', 50);

-- Update enrollment counts
UPDATE learning_journeys SET enrollment_count = 
    (SELECT COUNT(*) FROM enrollments WHERE journey_id = learning_journeys.id);

UPDATE courses SET enrollment_count = 
    (SELECT COUNT(*) FROM enrollments WHERE course_id = courses.id);
