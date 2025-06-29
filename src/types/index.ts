// Stop schedule represents a single bus/tram departure
export interface StopSchedule {
  time: string;
  busNumber: string;
  destination: string;
}

// Timetable page data structure
export interface TimetablePageData {
  id: string;
  stopName: string;
  stopId: string;
  theme: 'color' | 'bw';
  data: StopSchedule[];
}

// API response structures
export interface StopSuggestion {
  label: string;
  id?: string;
  html?: string;
  iconclass?: string;
  x?: string;
  y?: string;
  lat?: number;
  lon?: number;
}

export interface StationboardResponse {
  stop: {
    id: string;
    name: string;
    x?: string;
    y?: string;
    lon?: number;
    lat?: number;
  };
  connections: Array<{
    time: string;
    type: string;
    line: string;
    terminal: {
      id: string;
      name: string;
    };
    [key: string]: any;
  }>;
}

// Bus/tram filter 
export interface BusFilter {
  id: string;
  number: string;
  direction?: string;
}

// Database models
export interface Project {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

export interface Timetable extends TimetablePageData {
  project_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  is_premium: boolean;
  created_at: string;
  avatar_url?: string;
  full_name?: string;
}

export interface AuthError extends Error {
  message: string;
  status?: number;
}