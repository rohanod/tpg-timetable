import axios from 'axios';
import { StopSuggestion, StationboardResponse, StopSchedule } from '../types';

const API_BASE_URL = 'https://search.ch/timetable/api';

// Fetch stop suggestions based on search term
export const searchStops = async (term: string): Promise<StopSuggestion[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/completion.json`, {
      params: {
        term,
        show_ids: 1,
        show_coordinates: 1
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching for stops:', error);
    return [];
  }
};

// Fetch stop schedule
export const fetchStationboard = async (
  stopId: string, 
  options: { 
    date?: string; 
    time?: string;
    transportation_types?: string;
  } = {}
): Promise<StopSchedule[]> => {
  try {
    const params: Record<string, any> = {
      stop: stopId,
      limit: 200,
      show_tracks: 1,
      show_subsequent_stops: 1
    };
    
    // Only add time parameter if it's provided
    if (options.time) {
      params.time = options.time;
    }
    
    // Add other optional parameters
    if (options.date) {
      params.date = options.date;
    }
    
    if (options.transportation_types) {
      params.transportation_types = options.transportation_types;
    }
    
    const response = await axios.get(`${API_BASE_URL}/stationboard.json`, { params });
    
    const data: StationboardResponse = response.data;
    
    // Transform the API response to our app's data format
    return data.connections.map(connection => ({
      time: connection.time.split(' ')[1], // Extract just the time part
      busNumber: connection.line,
      destination: connection.terminal.name
    }));
  } catch (error) {
    console.error('Error fetching stationboard:', error);
    return [];
  }
};

// For demo/fallback purposes
export const getDemoSchedule = (stopName: string): StopSchedule[] => {
  if (stopName.toLowerCase().includes('bouchet')) {
    return [
      { time: "06:42", busNumber: "10", destination: "Genève-Aéroport, Terminal" },
      { time: "06:43", busNumber: "10", destination: "Genève, Rive" },
      { time: "06:51", busNumber: "10", destination: "Genève-Aéroport, Terminal" },
      { time: "06:58", busNumber: "10", destination: "Genève, Rive" },
      { time: "07:00", busNumber: "10", destination: "Genève-Aéroport, Terminal" },
      { time: "07:10", busNumber: "10", destination: "Genève-Aéroport, Terminal" },
      { time: "07:12", busNumber: "10", destination: "Genève, Rive" },
      { time: "07:17", busNumber: "10", destination: "Genève-Aéroport, Terminal" },
      { time: "07:20", busNumber: "10", destination: "Genève, Rive" },
      { time: "07:27", busNumber: "10", destination: "Genève-Aéroport, Terminal" },
      { time: "07:29", busNumber: "10", destination: "Genève, Rive" }
    ];
  }
  return [];
};