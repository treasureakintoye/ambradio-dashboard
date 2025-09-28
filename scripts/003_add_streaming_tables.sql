-- Add streaming-related tables to support audio streaming functionality

-- Streams table for managing multiple audio streams per station
CREATE TABLE IF NOT EXISTS streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  port INTEGER NOT NULL,
  bitrate INTEGER DEFAULT 128,
  format TEXT DEFAULT 'MP3',
  max_listeners INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listener sessions for tracking stream connections
CREATE TABLE IF NOT EXISTS listener_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id TEXT NOT NULL,
  listener_id TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN disconnected_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (disconnected_at - connected_at))::INTEGER
      ELSE NULL
    END
  ) STORED
);

-- Stream statistics for analytics
CREATE TABLE IF NOT EXISTS stream_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  listener_count INTEGER DEFAULT 0,
  peak_listeners INTEGER DEFAULT 0,
  bytes_sent BIGINT DEFAULT 0,
  songs_played INTEGER DEFAULT 0
);

-- Now playing information
CREATE TABLE IF NOT EXISTS now_playing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE NOT NULL,
  song_title TEXT,
  artist TEXT,
  album TEXT,
  duration_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  artwork_url TEXT,
  is_live BOOLEAN DEFAULT false
);

-- Enable RLS on all new tables
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE listener_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE now_playing ENABLE ROW LEVEL SECURITY;

-- RLS policies for streams
CREATE POLICY "Users can view their own streams" ON streams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streams" ON streams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streams" ON streams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streams" ON streams
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for listener_sessions (read-only for station owners)
CREATE POLICY "Station owners can view listener sessions" ON listener_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stations s 
      WHERE s.user_id = auth.uid()
    )
  );

-- RLS policies for stream_stats (read-only for station owners)
CREATE POLICY "Station owners can view stream stats" ON stream_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stations s 
      WHERE s.user_id = auth.uid()
    )
  );

-- RLS policies for now_playing
CREATE POLICY "Users can view their station's now playing" ON now_playing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stations s 
      WHERE s.id = station_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their station's now playing" ON now_playing
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stations s 
      WHERE s.id = station_id AND s.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_streams_user_id ON streams(user_id);
CREATE INDEX IF NOT EXISTS idx_streams_station_id ON streams(station_id);
CREATE INDEX IF NOT EXISTS idx_listener_sessions_stream_id ON listener_sessions(stream_id);
CREATE INDEX IF NOT EXISTS idx_listener_sessions_connected_at ON listener_sessions(connected_at);
CREATE INDEX IF NOT EXISTS idx_stream_stats_stream_id ON stream_stats(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_stats_timestamp ON stream_stats(timestamp);
CREATE INDEX IF NOT EXISTS idx_now_playing_station_id ON now_playing(station_id);

-- Create updated_at trigger for streams table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_streams_updated_at 
  BEFORE UPDATE ON streams 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
