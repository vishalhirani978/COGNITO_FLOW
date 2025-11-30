/*
  # CognitoFlow Database Schema

  ## Overview
  Creates the database structure for CognitoFlow - an AI-powered exam analysis platform
  that analyzes past papers and provides insights on topic trends and teacher-specific patterns.

  ## New Tables
  
  ### `papers`
  - `id` (uuid, primary key) - Unique identifier for each uploaded paper
  - `title` (text) - Name/title of the exam paper
  - `subject` (text) - Subject name (e.g., DSA, Algorithms)
  - `year` (integer) - Academic year of the paper
  - `teacher_name` (text, nullable) - Name of the teacher (e.g., Mr. Atta, Mr. Aurangzeb)
  - `file_content` (text) - Extracted text content from the PDF
  - `uploaded_at` (timestamptz) - Upload timestamp
  - `user_id` (uuid, nullable) - Reference to the user who uploaded (for future auth)

  ### `topics`
  - `id` (uuid, primary key) - Unique identifier for each detected topic
  - `paper_id` (uuid, foreign key) - References the parent paper
  - `topic_name` (text) - Name of the detected topic (e.g., Dynamic Programming)
  - `marks` (integer) - Marks allocated to this topic
  - `question_count` (integer) - Number of questions in this topic
  - `keywords` (text[]) - Array of keywords associated with the topic

  ### `analysis_cache`
  - `id` (uuid, primary key) - Unique identifier
  - `cache_key` (text, unique) - Hash of analysis parameters (subject, years, teachers)
  - `analysis_data` (jsonb) - Cached heatmap and analysis results
  - `created_at` (timestamptz) - Cache creation time
  - `expires_at` (timestamptz) - Cache expiration time

  ## Security
  - Enable RLS on all tables
  - Allow public read access for demo purposes (can be restricted later)
  - Allow public insert for paper uploads (can be restricted to authenticated users later)
*/

CREATE TABLE IF NOT EXISTS papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  year integer NOT NULL CHECK (year >= 2000 AND year <= 2100),
  teacher_name text,
  file_content text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  user_id uuid
);

CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  topic_name text NOT NULL,
  marks integer DEFAULT 0 CHECK (marks >= 0),
  question_count integer DEFAULT 1 CHECK (question_count >= 0),
  keywords text[] DEFAULT ARRAY[]::text[]
);

CREATE TABLE IF NOT EXISTS analysis_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  analysis_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 hour')
);

CREATE INDEX IF NOT EXISTS idx_papers_subject_year ON papers(subject, year);
CREATE INDEX IF NOT EXISTS idx_papers_teacher ON papers(teacher_name);
CREATE INDEX IF NOT EXISTS idx_topics_paper_id ON topics(paper_id);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_key ON analysis_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires ON analysis_cache(expires_at);

ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to papers"
  ON papers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to papers"
  ON papers FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to topics"
  ON topics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to topics"
  ON topics FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to analysis cache"
  ON analysis_cache FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to analysis cache"
  ON analysis_cache FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete expired cache"
  ON analysis_cache FOR DELETE
  TO public
  USING (expires_at < now());