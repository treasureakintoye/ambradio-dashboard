-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'dj', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stations table
CREATE TABLE IF NOT EXISTS public.stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  short_name TEXT UNIQUE NOT NULL,
  frontend_type TEXT DEFAULT 'icecast' CHECK (frontend_type IN ('icecast', 'shoutcast')),
  backend_type TEXT DEFAULT 'liquidsoap' CHECK (backend_type IN ('liquidsoap', 'azurarelay')),
  listen_url TEXT,
  public_player_embed_code TEXT,
  enable_requests BOOLEAN DEFAULT true,
  enable_streamers BOOLEAN DEFAULT true,
  enable_public_page BOOLEAN DEFAULT true,
  enable_on_demand BOOLEAN DEFAULT false,
  default_album_art_url TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media files table
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  unique_id TEXT UNIQUE NOT NULL,
  song_id TEXT,
  title TEXT,
  artist TEXT,
  album TEXT,
  genre TEXT,
  lyrics TEXT,
  art_url TEXT,
  path TEXT NOT NULL,
  length NUMERIC DEFAULT 0,
  length_text TEXT,
  fade_overlap NUMERIC DEFAULT 0,
  fade_in NUMERIC DEFAULT 0,
  fade_out NUMERIC DEFAULT 0,
  cue_in NUMERIC DEFAULT 0,
  cue_out NUMERIC DEFAULT 0,
  amplify NUMERIC DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_playable BOOLEAN DEFAULT true,
  play_count INTEGER DEFAULT 0,
  skip_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'default' CHECK (type IN ('default', 'once_per_x_songs', 'once_per_x_minutes', 'once_per_hour', 'advanced')),
  source TEXT DEFAULT 'songs' CHECK (source IN ('songs', 'remote_url')),
  remote_url TEXT,
  remote_type TEXT CHECK (remote_type IN ('stream', 'playlist')),
  is_enabled BOOLEAN DEFAULT true,
  include_in_automation BOOLEAN DEFAULT true,
  include_in_on_demand BOOLEAN DEFAULT true,
  include_in_requests BOOLEAN DEFAULT true,
  weight SMALLINT DEFAULT 3 CHECK (weight >= 1 AND weight <= 25),
  play_per_songs INTEGER DEFAULT 0,
  play_per_minutes INTEGER DEFAULT 0,
  play_per_hour_minute INTEGER DEFAULT 0,
  order_type TEXT DEFAULT 'shuffle' CHECK (order_type IN ('shuffle', 'random', 'sequential')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist media junction table
CREATE TABLE IF NOT EXISTS public.playlist_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  weight SMALLINT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, media_id)
);

-- Create schedule table for playlist scheduling
CREATE TABLE IF NOT EXISTS public.schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  start_time TIME,
  end_time TIME,
  start_date DATE,
  end_date DATE,
  days TEXT[], -- Array of days: ['monday', 'tuesday', etc.]
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listeners table for analytics
CREATE TABLE IF NOT EXISTS public.listeners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  listener_uid TEXT NOT NULL,
  listener_ip TEXT,
  listener_user_agent TEXT,
  connected_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  disconnected_on TIMESTAMP WITH TIME ZONE,
  connected_seconds INTEGER DEFAULT 0
);

-- Create song history table
CREATE TABLE IF NOT EXISTS public.song_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media(id) ON DELETE SET NULL,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  duration INTEGER,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  listeners_start INTEGER DEFAULT 0,
  listeners_end INTEGER DEFAULT 0,
  unique_listeners INTEGER DEFAULT 0
);

-- Create requests table
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  requester_ip TEXT,
  requester_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'played')),
  played_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create streamers table for live DJ functionality
CREATE TABLE IF NOT EXISTS public.streamers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  streamer_username TEXT NOT NULL,
  streamer_password TEXT NOT NULL,
  display_name TEXT,
  comments TEXT,
  is_active BOOLEAN DEFAULT true,
  enforce_schedule BOOLEAN DEFAULT false,
  reactivate_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(station_id, streamer_username)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listeners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streamers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for stations (users can only access stations they own or are assigned to)
CREATE POLICY "Users can view their own stations" ON public.stations FOR SELECT USING (
  auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM public.streamers WHERE station_id = stations.id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own stations" ON public.stations FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert their own stations" ON public.stations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own stations" ON public.stations FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS policies for media (based on station ownership)
CREATE POLICY "Users can view media from their stations" ON public.media FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stations WHERE id = media.station_id AND (owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.streamers WHERE station_id = stations.id AND user_id = auth.uid())))
);
CREATE POLICY "Users can manage media in their stations" ON public.media FOR ALL USING (
  EXISTS (SELECT 1 FROM public.stations WHERE id = media.station_id AND owner_id = auth.uid())
);

-- Create RLS policies for playlists (based on station ownership)
CREATE POLICY "Users can view playlists from their stations" ON public.playlists FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stations WHERE id = playlists.station_id AND (owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.streamers WHERE station_id = stations.id AND user_id = auth.uid())))
);
CREATE POLICY "Users can manage playlists in their stations" ON public.playlists FOR ALL USING (
  EXISTS (SELECT 1 FROM public.stations WHERE id = playlists.station_id AND owner_id = auth.uid())
);

-- Create RLS policies for other tables (similar pattern)
CREATE POLICY "Users can view playlist_media from their stations" ON public.playlist_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.playlists p JOIN public.stations s ON p.station_id = s.id 
    WHERE p.id = playlist_media.playlist_id AND (s.owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.streamers WHERE station_id = s.id AND user_id = auth.uid())))
);
CREATE POLICY "Users can manage playlist_media in their stations" ON public.playlist_media FOR ALL USING (
  EXISTS (SELECT 1 FROM public.playlists p JOIN public.stations s ON p.station_id = s.id 
    WHERE p.id = playlist_media.playlist_id AND s.owner_id = auth.uid())
);

-- Similar policies for schedule, listeners, song_history, requests, and streamers tables
CREATE POLICY "Users can view schedule from their stations" ON public.schedule FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stations WHERE id = schedule.station_id AND (owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.streamers WHERE station_id = stations.id AND user_id = auth.uid())))
);
CREATE POLICY "Users can manage schedule in their stations" ON public.schedule FOR ALL USING (
  EXISTS (SELECT 1 FROM public.stations WHERE id = schedule.station_id AND owner_id = auth.uid())
);

CREATE POLICY "Users can view listeners from their stations" ON public.listeners FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stations WHERE id = listeners.station_id AND (owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.streamers WHERE station_id = stations.id AND user_id = auth.uid())))
);

CREATE POLICY "Users can view song_history from their stations" ON public.song_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stations WHERE id = song_history.station_id AND (owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.streamers WHERE station_id = stations.id AND user_id = auth.uid())))
);

CREATE POLICY "Users can view requests from their stations" ON public.requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stations WHERE id = requests.station_id AND (owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.streamers WHERE station_id = stations.id AND user_id = auth.uid())))
);
CREATE POLICY "Users can manage requests in their stations" ON public.requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.stations WHERE id = requests.station_id AND owner_id = auth.uid())
);

CREATE POLICY "Users can view streamers from their stations" ON public.streamers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stations WHERE id = streamers.station_id AND owner_id = auth.uid()) OR
  user_id = auth.uid()
);
CREATE POLICY "Users can manage streamers in their stations" ON public.streamers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.stations WHERE id = streamers.station_id AND owner_id = auth.uid())
);
