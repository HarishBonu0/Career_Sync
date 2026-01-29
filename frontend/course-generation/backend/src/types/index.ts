export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'learner' | 'educator' | 'admin';
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface LearningJourney {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  who_is_for?: string;
  who_is_not_for?: string;
  published_date: Date;
  start_date?: Date;
  creator_id: string;
  thumbnail_url?: string;
  course_count: number;
  enrollment_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  published_date: Date;
  creator_id: string;
  journey_id?: string;
  thumbnail_url?: string;
  enrollment_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id?: string;
  journey_id?: string;
  enrolled_at: Date;
  progress: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
