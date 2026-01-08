/*
  # Create Video Download Schema

  ## Overview
  This migration sets up the database schema for a modern video downloading web application.

  ## New Tables
  
  ### `downloads`
  Stores active and queued downloads
  - `id` (uuid, primary key) - Unique download identifier
  - `user_id` (uuid) - Reference to authenticated user
  - `url` (text) - Video URL to download
  - `title` (text) - Video title
  - `thumbnail` (text) - Thumbnail URL
  - `format` (text) - Selected format (video/audio)
  - `quality` (text) - Selected quality
  - `status` (text) - Download status: pending, downloading, completed, failed
  - `progress` (integer) - Download progress percentage (0-100)
  - `file_size` (bigint) - File size in bytes
  - `download_speed` (text) - Current download speed
  - `eta` (text) - Estimated time remaining
  - `error_message` (text) - Error details if failed
  - `created_at` (timestamptz) - When download was created
  - `updated_at` (timestamptz) - Last update timestamp
  - `completed_at` (timestamptz) - When download completed

  ### `download_history`
  Stores completed download history
  - `id` (uuid, primary key) - Unique history entry identifier
  - `user_id` (uuid) - Reference to authenticated user
  - `url` (text) - Original video URL
  - `title` (text) - Video title
  - `thumbnail` (text) - Thumbnail URL
  - `format` (text) - Downloaded format
  - `quality` (text) - Downloaded quality
  - `file_size` (bigint) - Final file size in bytes
  - `duration` (integer) - Download duration in seconds
  - `downloaded_at` (timestamptz) - When download completed

  ## Security
  
  - Enable Row Level Security (RLS) on all tables
  - Users can only access their own downloads
  - Users can only view their own history
  - Authenticated users can create new downloads
  
  ## Important Notes
  
  1. All tables use RLS to ensure data isolation between users
  2. Default values ensure data consistency
  3. Timestamps track download lifecycle
  4. Status field enables queue management
*/

-- Create downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  title text DEFAULT '',
  thumbnail text DEFAULT '',
  format text DEFAULT 'video',
  quality text DEFAULT 'best',
  status text DEFAULT 'pending',
  progress integer DEFAULT 0,
  file_size bigint DEFAULT 0,
  download_speed text DEFAULT '',
  eta text DEFAULT '',
  error_message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create download_history table
CREATE TABLE IF NOT EXISTS download_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  title text NOT NULL,
  thumbnail text DEFAULT '',
  format text DEFAULT 'video',
  quality text DEFAULT 'best',
  file_size bigint DEFAULT 0,
  duration integer DEFAULT 0,
  downloaded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_history ENABLE ROW LEVEL SECURITY;

-- Downloads policies
CREATE POLICY "Users can view own downloads"
  ON downloads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own downloads"
  ON downloads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own downloads"
  ON downloads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own downloads"
  ON downloads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Download history policies
CREATE POLICY "Users can view own history"
  ON download_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create history entries"
  ON download_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON download_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_status ON downloads(status);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_download_history_user_id ON download_history(user_id);
CREATE INDEX IF NOT EXISTS idx_download_history_downloaded_at ON download_history(downloaded_at DESC);