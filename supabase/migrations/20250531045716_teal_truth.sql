/*
  # Initial Schema Setup
  
  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `email` (text, nullable)
      - `is_premium` (boolean, default false)
      - `created_at` (timestamp with time zone, default now())
      - `full_name` (text, nullable)
      - `avatar_url` (text, nullable)
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp with time zone, default now())
    - `timetables`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `stopName` (text, not null)
      - `stopId` (text, not null)
      - `theme` (text, not null)
      - `data` (jsonb, not null)
      - `created_at` (timestamp with time zone, default now())
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  full_name TEXT,
  avatar_url TEXT
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create timetables table
CREATE TABLE IF NOT EXISTS timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "stopName" TEXT NOT NULL,
  "stopId" TEXT NOT NULL,
  theme TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policies for projects
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for timetables
CREATE POLICY "Users can view timetables of own projects"
  ON timetables
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM projects WHERE id = timetables.project_id
    )
  );

CREATE POLICY "Users can insert timetables in own projects"
  ON timetables
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM projects WHERE id = timetables.project_id
    )
  );

CREATE POLICY "Users can update timetables in own projects"
  ON timetables
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM projects WHERE id = timetables.project_id
    )
  );

CREATE POLICY "Users can delete timetables in own projects"
  ON timetables
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM projects WHERE id = timetables.project_id
    )
  );