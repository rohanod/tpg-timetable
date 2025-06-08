import axios from 'axios';
import { StopSuggestion, StationboardResponse, StopSchedule } from '../types';

const API_BASE_URL = 'https://search.ch/timetable/api';

/**
 * Search for bus/tram stops based on a search term
 */
export const searchStops = async (term: string): Promise<StopSuggestion[]> => {
  if (!term || term.length < 2) return [];
  
  try {
    const response = await axios.get(`${API_BASE_URL}/completion.json`, {
      params: {
        term,
        show_ids: 1,
        show_coordinates: 1
      }
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error searching for stops:', error);
    return [];
  }
};

/**
 * Fetch schedule for a specific stop
 */
export const fetchStationboard = async (
  stopId: string, 
  options: { 
    date?: string; 
    time?: string;
    transportation_types?: string;
  } = {}
): Promise<StopSchedule[]> => {
  if (!stopId) return [];
  
  try {
    const params: Record<string, any> = {
      stop: stopId,
      limit: 50,
      show_tracks: 1,
      show_subsequent_stops: 1
    };
    
    // Add optional parameters if provided
    if (options.time) params.time = options.time;
    if (options.date) params.date = options.date;
    if (options.transportation_types) params.transportation_types = options.transportation_types;
    
    const response = await axios.get(`${API_BASE_URL}/stationboard.json`, { params });
    const data: StationboardResponse = response.data;
    
    // Transform the API response to our app's data format
    return data.connections.map(connection => ({
      time: connection.time.split(' ')[1] || connection.time, // Extract just the time part
      busNumber: connection.line,
      destination: connection.terminal.name
    }));
  } catch (error) {
    console.error('Error fetching stationboard:', error);
    return [];
  }
};

/**
 * Generate demo schedule data for testing or fallback purposes
 */
export const getDemoSchedule = (stopName: string): StopSchedule[] => {
  // Return a different demo schedule based on stop name
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
  
  if (stopName.toLowerCase().includes('airport') || stopName.toLowerCase().includes('aéroport')) {
    return [
      { time: "08:05", busNumber: "5", destination: "Thônex-Vallard" },
      { time: "08:10", busNumber: "10", destination: "Rive" },
      { time: "08:15", busNumber: "5", destination: "Nations" },
      { time: "08:20", busNumber: "10", destination: "Rive" },
      { time: "08:25", busNumber: "5", destination: "Thônex-Vallard" },
      { time: "08:30", busNumber: "10", destination: "Rive" },
      { time: "08:35", busNumber: "5", destination: "Nations" },
      { time: "08:40", busNumber: "10", destination: "Rive" },
      { time: "08:45", busNumber: "5", destination: "Thônex-Vallard" },
      { time: "08:50", busNumber: "28", destination: "Jardin Botanique" }
    ];
  }
  
  // Default demo schedule
  return [
    { time: "09:05", busNumber: "12", destination: "Central Station" },
    { time: "09:15", busNumber: "7", destination: "City Hall" },
    { time: "09:25", busNumber: "12", destination: "Central Station" },
    { time: "09:30", busNumber: "15", destination: "University" },
    { time: "09:45", busNumber: "7", destination: "City Hall" },
    { time: "10:00", busNumber: "12", destination: "Central Station" },
    { time: "10:15", busNumber: "7", destination: "City Hall" },
    { time: "10:30", busNumber: "15", destination: "University" },
    { time: "10:45", busNumber: "7", destination: "City Hall" }
  ];
};