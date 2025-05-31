import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TimetablePageData, StopSchedule, BusFilter } from '../types';

interface AppContextType {
  timetablePages: TimetablePageData[];
  addTimetablePage: (data?: TimetablePageData) => void;
  removeTimetablePage: (id: string) => void;
  updateTimetablePage: (id: string, data: Partial<TimetablePageData>) => void;
  filteredData: Record<string, StopSchedule[]>;
  updateFilteredData: (id: string, data: StopSchedule[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  busFilters: BusFilter[];
  addBusFilter: (filter: BusFilter) => void;
  removeBusFilter: (id: string) => void;
  updateBusFilter: (id: string, updates: Partial<BusFilter>) => void;
  timeFilter: string;
  setTimeFilter: (time: string) => void;
  selectedTimetable: string | null;
  setSelectedTimetable: (id: string | null) => void;
  setTimetablePages: (pages: TimetablePageData[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [timetablePages, setTimetablePages] = useState<TimetablePageData[]>([]);
  const [filteredData, setFilteredData] = useState<Record<string, StopSchedule[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [busFilters, setBusFilters] = useState<BusFilter[]>([]);
  const [timeFilter, setTimeFilter] = useState('');
  const [selectedTimetable, setSelectedTimetable] = useState<string | null>(null);

  const addTimetablePage = (data?: TimetablePageData) => {
    const newPage: TimetablePageData = data || {
      id: `temp-${Date.now()}`,
      stopName: 'Select a stop...',
      stopId: '',
      theme: 'color',
      data: []
    };
    
    setTimetablePages(prev => [...prev, newPage]);
    setFilteredData(prev => ({ ...prev, [newPage.id]: newPage.data }));
    setSelectedTimetable(newPage.id);
  };

  const removeTimetablePage = (id: string) => {
    setTimetablePages(prev => prev.filter(page => page.id !== id));
    setFilteredData(prev => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
    if (selectedTimetable === id) {
      setSelectedTimetable(null);
    }
  };

  const updateTimetablePage = (id: string, data: Partial<TimetablePageData>) => {
    setTimetablePages(prev => 
      prev.map(page => (page.id === id ? { ...page, ...data } : page))
    );
    
    // If the data field is updated, also update the filteredData
    if (data.data) {
      updateFilteredData(id, data.data);
    }
  };

  const updateFilteredData = (id: string, data: StopSchedule[]) => {
    setFilteredData(prev => ({ ...prev, [id]: data }));
  };

  const addBusFilter = (filter: BusFilter) => {
    setBusFilters(prev => [...prev, filter]);
  };

  const removeBusFilter = (id: string) => {
    setBusFilters(prev => prev.filter(filter => filter.id !== id));
  };

  const updateBusFilter = (id: string, updates: Partial<BusFilter>) => {
    setBusFilters(prev => 
      prev.map(filter => filter.id === id ? { ...filter, ...updates } : filter)
    );
  };

  // Apply filters whenever they change
  useEffect(() => {
    timetablePages.forEach(page => {
      if (!page.data) return;
      
      const originalData = page.data;
      let filteredResult = [...originalData];
      
      // Limit to 11 rows
      filteredResult = filteredResult.slice(0, 11);
      
      // Apply bus filters
      if (busFilters.length > 0) {
        filteredResult = filteredResult.filter(item =>
          busFilters.some(filter => {
            const numberMatch = filter.number === item.busNumber;
            const directionMatch = !filter.direction || filter.direction === item.destination;
            return numberMatch && directionMatch;
          })
        );
      }
      
      // Apply time filter
      if (timeFilter) {
        filteredResult = filteredResult.filter(item => item.time >= timeFilter);
      }
      
      updateFilteredData(page.id, filteredResult);
    });
  }, [busFilters, timeFilter, timetablePages]);

  return (
    <AppContext.Provider value={{
      timetablePages,
      addTimetablePage,
      removeTimetablePage,
      updateTimetablePage,
      filteredData,
      updateFilteredData,
      searchTerm,
      setSearchTerm,
      busFilters,
      addBusFilter,
      removeBusFilter,
      updateBusFilter,
      timeFilter,
      setTimeFilter,
      selectedTimetable,
      setSelectedTimetable,
      setTimetablePages
    }}>
      {children}
    </AppContext.Provider>
  );
};