-- =============================================================================
-- EthioIntern PostgreSQL Database Schema (Migration 001)
-- Normalized Relational Schema for Ethiopian Student Internship Platform
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('STUDENT', 'COMPANY', 'ADMIN')),
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 2. UNIVERSITIES (Ethiopian Public & Accredited Private Universities)
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  short_name VARCHAR(32) NOT NULL,
  city VARCHAR(120) NOT NULL,
  region VARCHAR(120) NOT NULL,
  website VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city);

-- 3. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  faculty VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. FIELDS OF STUDY
CREATE TABLE IF NOT EXISTS fields_of_study (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fields_department ON fields_of_study(department_id);

-- 5. SKILLS
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL UNIQUE,
  category VARCHAR(120) NOT NULL DEFAULT 'Technical',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);

-- 6. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100) NOT NULL,
  grandfather_name VARCHAR(100) NOT NULL DEFAULT '',
  phone VARCHAR(40),
  profile_photo VARCHAR(500),
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  field_of_study_id UUID REFERENCES fields_of_study(id) ON DELETE SET NULL,
  academic_level VARCHAR(32) NOT NULL DEFAULT 'BSc' CHECK (academic_level IN ('Diploma', 'BSc', 'BA', 'MSc', 'MA', 'PhD', 'Other')),
  graduation_year INTEGER NOT NULL DEFAULT 2027,
  gpa NUMERIC(3, 2),
  location VARCHAR(120) NOT NULL DEFAULT 'Addis Ababa',
  bio TEXT,
  languages JSONB NOT NULL DEFAULT '["Amharic", "English"]'::jsonb,
  experience JSONB NOT NULL DEFAULT '[]'::jsonb,
  portfolio_url VARCHAR(500),
  github_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  cv_url VARCHAR(500),
  availability VARCHAR(64) NOT NULL DEFAULT 'Immediate - Full-time Intern',
  is_portfolio_public BOOLEAN NOT NULL DEFAULT TRUE,
  expose_contact_info BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_university ON student_profiles(university_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_department ON student_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_field ON student_profiles(field_of_study_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_level ON student_profiles(academic_level);
CREATE INDEX IF NOT EXISTS idx_student_profiles_location ON student_profiles(location);
CREATE INDEX IF NOT EXISTS idx_student_profiles_availability ON student_profiles(availability);

-- 7. STUDENT SKILLS
CREATE TABLE IF NOT EXISTS student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency VARCHAR(32) NOT NULL DEFAULT 'Intermediate' CHECK (proficiency IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_student_skills_student ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_skill ON student_skills(skill_id);

-- 8. STUDENT EDUCATION
CREATE TABLE IF NOT EXISTS student_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(64) NOT NULL,
  field_of_study VARCHAR(255) NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER,
  gpa VARCHAR(20),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_education_student ON student_education(student_id);

-- 9. STUDENT PROJECTS
CREATE TABLE IF NOT EXISTS student_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
  project_url VARCHAR(500),
  github_url VARCHAR(500),
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_projects_student ON student_projects(student_id);

-- 10. STUDENT CERTIFICATIONS
CREATE TABLE IF NOT EXISTS student_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  credential_url VARCHAR(500),
  certificate_file_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_certifications_student ON student_certifications(student_id);

-- 11. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  description TEXT NOT NULL,
  industry VARCHAR(120) NOT NULL,
  website VARCHAR(500),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(120) NOT NULL DEFAULT 'Addis Ababa',
  address TEXT,
  company_size VARCHAR(64) NOT NULL DEFAULT '50-200 employees',
  founded_year INTEGER,
  tin_number VARCHAR(64),
  business_license_url VARCHAR(500),
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_verification ON companies(verification_status);
CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(location);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);

-- 12. COMPANY VERIFICATIONS (Audit Log & Requests)
CREATE TABLE IF NOT EXISTS company_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tin_number VARCHAR(64) NOT NULL,
  registration_number VARCHAR(100),
  document_url VARCHAR(500),
  notes TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_verifications_company ON company_verifications(company_id);
CREATE INDEX IF NOT EXISTS idx_company_verifications_status ON company_verifications(status);

-- 13. INTERNSHIPS
CREATE TABLE IF NOT EXISTS internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  department_team VARCHAR(150) NOT NULL,
  location VARCHAR(120) NOT NULL,
  work_mode VARCHAR(32) NOT NULL CHECK (work_mode IN ('On-site', 'Remote', 'Hybrid')),
  duration VARCHAR(64) NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 3,
  start_date DATE NOT NULL,
  application_deadline DATE NOT NULL,
  positions INTEGER NOT NULL DEFAULT 1,
  academic_levels JSONB NOT NULL DEFAULT '["BSc"]'::jsonb,
  fields_of_study JSONB NOT NULL DEFAULT '[]'::jsonb,
  minimum_requirements TEXT NOT NULL,
  responsibilities TEXT NOT NULL,
  benefits TEXT,
  stipend_amount INTEGER NOT NULL DEFAULT 0,
  stipend_currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
  is_paid BOOLEAN NOT NULL DEFAULT TRUE,
  application_instructions TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Pending Review', 'Published', 'Closed', 'Rejected', 'Archived')),
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internships_company ON internships(company_id);
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_location ON internships(location);
CREATE INDEX IF NOT EXISTS idx_internships_work_mode ON internships(work_mode);
CREATE INDEX IF NOT EXISTS idx_internships_deadline ON internships(application_deadline);
CREATE INDEX IF NOT EXISTS idx_internships_stipend ON internships(stipend_amount);

-- 14. INTERNSHIP SKILLS
CREATE TABLE IF NOT EXISTS internship_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (internship_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_internship_skills_internship ON internship_skills(internship_id);
CREATE INDEX IF NOT EXISTS idx_internship_skills_skill ON internship_skills(skill_id);

-- 15. APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  cv_url VARCHAR(500) NOT NULL,
  cover_letter TEXT NOT NULL,
  availability_note VARCHAR(255),
  match_score INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Shortlisted', 'Interview', 'Accepted', 'Rejected', 'Withdrawn')),
  company_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, internship_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- 16. INTERVIEWS
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  start_time VARCHAR(16) NOT NULL,
  end_time VARCHAR(16) NOT NULL,
  interview_type VARCHAR(32) NOT NULL CHECK (interview_type IN ('Online', 'In-person', 'Phone')),
  meeting_link VARCHAR(500),
  location VARCHAR(255),
  notes TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Rescheduled', 'Cancelled', 'Confirmed')),
  student_response VARCHAR(32) NOT NULL DEFAULT 'Pending' CHECK (student_response IN ('Pending', 'Confirmed', 'Reschedule Requested', 'Declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_application ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(scheduled_date);

-- 17. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- 18. SAVED INTERNSHIPS
CREATE TABLE IF NOT EXISTS saved_internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, internship_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_internships_student ON saved_internships(student_id);

-- 19. REPORTS (Abuse / Fraudulent Posting / User Reports)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(32) NOT NULL CHECK (target_type IN ('INTERNSHIP', 'COMPANY', 'STUDENT')),
  target_id UUID NOT NULL,
  reason VARCHAR(255) NOT NULL,
  details TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED', 'DISMISSED')),
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- 20. ADMIN ACTIONS (Audit Trail)
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(64) NOT NULL,
  target_type VARCHAR(64) NOT NULL,
  target_id UUID NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_id);
