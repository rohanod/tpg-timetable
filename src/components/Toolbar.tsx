import { useState, useRef, useEffect } from 'react';
import { Search, Clock, FileDown, Plus, X, Filter } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { searchStops, fetchStationboard, getDemoSchedule } from '../services/api';
import { StopSuggestion } from '../types';
import { ProjectService } from '../services/projects';
import { toast } from 'react-hot-toast';

interface ToolbarProps {
  projectId?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ projectId }) => {
  const { 
    addTimetablePage, 
    timetablePages,
    setSearchTerm,
    busFilters,
    addBusFilter,
    removeBusFilter,
    updateBusFilter,
    setTimeFilter,
    selectedTimetable,
    updateTimetablePage,
    updateFilteredData,
    setTimetablePages,
    timeFilter
  } = useAppContext();
  
  const [stopSuggestions, setStopSuggestions] = useState<StopSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [busInput, setBusInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [editingFilter, setEditingFilter] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userCanAddTimetable, setUserCanAddTimetable] = useState(true);
  const [updateTimerId, setUpdateTimerId] = useState<NodeJS.Timeout | null>(null);
  
  const busInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Check timetable limit on component load
  useEffect(() => {
    if (projectId) {
      checkTimetableLimit();
    }
  }, [projectId, timetablePages]);
  
  // Auto-update effect - update 2 seconds after last filter change
  useEffect(() => {
    if (!selectedTimetable) return;
    
    if (updateTimerId) {
      clearTimeout(updateTimerId);
    }
    
    const timerId = setTimeout(() => {
      handleUpdateFilters();
    }, 2000);
    
    setUpdateTimerId(timerId);
    
    return () => {
      if (updateTimerId) clearTimeout(updateTimerId);
    };
  }, [timeInput, busFilters, selectedTimetable]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkTimetableLimit = async () => {
    try {
      const { data: userProfile } = await ProjectService.getUserPermissions();
      
      if (timetablePages.length >= 3) {
        setUserCanAddTimetable(false);
      } else {
        setUserCanAddTimetable(true);
      }
    } catch (error) {
      console.error('Error checking timetable limit:', error);
    }
  };

  // Handle search input changes
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (value.length > 2) {
      try {
        const suggestions = await searchStops(value);
        setStopSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setStopSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle stop selection
  const handleStopSelection = async (stop: StopSuggestion) => {
    setSearchInput(stop.label);
    setShowSuggestions(false);
    setSearchTerm(stop.label);
    
    const targetPage = selectedTimetable || (timetablePages.length > 0 ? timetablePages[timetablePages.length - 1].id : null);
    
    if (!targetPage) {
      // Create a new standalone timetable if none selected and none exist
      addTimetablePage({
        id: `temp-${Date.now()}`,
        stopName: stop.label,
        stopId: stop.id || '',
        theme: 'color',
        data: []
      });
      return;
    }
    
    try {
      setIsUpdating(true);
      let scheduleData = await fetchStationboard(stop.id || stop.label, {
        time: timeInput || undefined
      });
      
      if (scheduleData.length === 0) {
        scheduleData = getDemoSchedule(stop.label);
        toast.info('Using demo data as no real schedule was found');
      }
      
      updateTimetablePage(targetPage, {
        stopName: stop.label,
        stopId: stop.id || '',
        data: scheduleData
      });
      
      updateFilteredData(targetPage, scheduleData);
      
      if (projectId) {
        // Update in database if we're in a project
        await ProjectService.updateTimetable(targetPage, {
          stopName: stop.label,
          stopId: stop.id || '',
          data: scheduleData
        });
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to fetch schedule data');
      
      // Use demo data as fallback
      const demoData = getDemoSchedule(stop.label);
      updateTimetablePage(targetPage, {
        stopName: stop.label,
        stopId: stop.id || '',
        data: demoData
      });
      updateFilteredData(targetPage, demoData);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stopSuggestions.length > 0) {
      handleStopSelection(stopSuggestions[0]);
    } else if (searchInput) {
      handleStopSelection({ label: searchInput });
    }
  };

  const handleBusInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && busInput.trim()) {
      addBusFilter({
        id: `filter-${Date.now()}`,
        number: busInput.trim()
      });
      setBusInput('');
    }
  };

  const handleFilterSettings = (filterId: string) => {
    setEditingFilter(editingFilter === filterId ? null : filterId);
  };

  const handleDirectionSelect = (filterId: string, direction: string) => {
    updateBusFilter(filterId, { direction });
    setEditingFilter(null);
  };

  const handleTimeFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeInput(value);
    setTimeFilter(value);
  };

  const handleUpdateFilters = async () => {
    if (!selectedTimetable) return;
    
    const selectedPage = timetablePages.find(page => page.id === selectedTimetable);
    if (!selectedPage || !selectedPage.stopId) return;
    
    try {
      setIsUpdating(true);
      
      // Refresh the data with time filter if set
      let scheduleData = await fetchStationboard(selectedPage.stopId, {
        time: timeInput || undefined
      });
      
      if (scheduleData.length === 0) {
        scheduleData = getDemoSchedule(selectedPage.stopName);
      }
      
      updateTimetablePage(selectedTimetable, {
        data: scheduleData
      });
      
      updateFilteredData(selectedTimetable, scheduleData);

      if (projectId) {
        // Update in database if we're in a project
        await ProjectService.updateTimetable(selectedTimetable, {
          data: scheduleData
        });
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNewPage = async () => {
    if (!userCanAddTimetable && projectId) {
      toast.error('You can only create up to 3 timetables per project');
      return;
    }
    
    if (projectId) {
      try {
        // For projects, create a new empty timetable
        const newPage = {
          stopName: 'Select a stop...',
          stopId: '',
          theme: 'color' as const,
          data: []
        };
        
        // First create the timetable in the database
        const savedTimetable = await ProjectService.addTimetable(projectId, newPage);
        
        if (savedTimetable) {
          // Then add the timetable to the UI with the database UUID
          addTimetablePage({
            id: savedTimetable.id,
            stopName: savedTimetable.stopName,
            stopId: savedTimetable.stopId,
            theme: savedTimetable.theme as 'color' | 'bw',
            data: savedTimetable.data || []
          });
          toast.success('New timetable created');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to create timetable');
      }
    } else {
      // For standalone mode, create a demo timetable
      const demoData = getDemoSchedule('Demo Stop');
      addTimetablePage({
        id: `temp-${Date.now()}`,
        stopName: 'Demo Stop',
        stopId: 'demo',
        theme: 'color',
        data: demoData
      });
    }
  };

  const handlePrintAllPDF = () => {
    if (timetablePages.length === 0) {
      toast.error('No timetables to export');
      return;
    }
    
    // Use the browser's print functionality
    window.print();
  };

  return (
    <div className="sticky top-0 z-10 print:hidden">
      <div className="controls-container flex flex-col gap-4 p-4 bg-white shadow-lg rounded-lg m-2 sm:m-4">
        <div className="flex flex-wrap gap-2 items-center">
          <form onSubmit={handleSearchSubmit} className="flex-grow flex items-center relative min-w-[200px]">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={selectedTimetable ? "Update selected timetable..." : "Search for stop..."}
                value={searchInput}
                onChange={handleSearchChange}
                className="p-2 pl-9 border border-gray-300 rounded-md text-sm w-full bg-white"
                aria-label="Search for bus or tram stop"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              
              {showSuggestions && stopSuggestions.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-20 max-h-60 overflow-y-auto"
                  data-testid="stop-suggestions"
                >
                  {stopSuggestions.map((stop, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-orange-50 cursor-pointer"
                      onClick={() => handleStopSelection(stop)}
                      data-testid={`stop-suggestion-${index}`}
                    >
                      {stop.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`px-3 py-2 ${showFiltersPanel ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600'} text-white rounded-md text-sm flex items-center gap-1.5 transition-colors`}
            aria-expanded={showFiltersPanel}
            aria-controls="filters-panel"
          >
            <Filter size={18} /> 
            Filters {busFilters.length > 0 && `(${busFilters.length})`}
          </button>
          
          <button
            onClick={handleNewPage}
            className={`px-3 py-2 ${!userCanAddTimetable ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} text-white rounded-md text-sm flex items-center gap-1.5 transition-colors`}
            disabled={!userCanAddTimetable}
            title={!userCanAddTimetable ? 'You can only create 3 timetables' : 'Add new timetable'}
            data-testid="new-timetable-button"
          >
            <Plus size={18} /> New Timetable
          </button>
          
          <button
            onClick={handlePrintAllPDF}
            className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm flex items-center gap-1.5 transition-colors"
            aria-label="Export as PDF"
            data-testid="export-pdf-button"
          >
            <FileDown size={18} /> Export PDF
          </button>
        </div>

        {showFiltersPanel && (
          <div id="filters-panel" className="filters-panel bg-orange-50 p-4 rounded-lg" data-testid="filters-panel">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-gray-700">Bus/Tram Filters</h3>
                <div className="flex gap-2 items-center">
                  <input
                    ref={busInputRef}
                    type="text"
                    placeholder="Add bus/tram number..."
                    value={busInput}
                    onChange={(e) => setBusInput(e.target.value)}
                    onKeyDown={handleBusInputKeyDown}
                    className="p-2 border border-gray-300 rounded-md text-sm bg-white flex-grow"
                    aria-label="Enter bus or tram number to filter"
                  />
                  <button
                    onClick={() => {
                      if (busInput.trim()) {
                        addBusFilter({
                          id: `filter-${Date.now()}`,
                          number: busInput.trim()
                        });
                        setBusInput('');
                      }
                    }}
                    className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm"
                    aria-label="Add bus filter"
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex gap-2 flex-wrap" data-testid="bus-filters-list">
                  {busFilters.map(filter => (
                    <div
                      key={filter.id}
                      className="flex items-center bg-white rounded-lg px-3 py-2 text-sm shadow-sm"
                      data-testid={`bus-filter-${filter.number}`}
                    >
                      <span className="font-medium">{filter.number}</span>
                      {filter.direction && (
                        <span className="ml-2 text-gray-600">→ {filter.direction}</span>
                      )}
                      <div className="ml-2 flex items-center gap-1">
                        <button
                          onClick={() => handleFilterSettings(filter.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          aria-label={`Set direction for bus ${filter.number}`}
                        >
                          <Filter size={14} />
                        </button>
                        <button
                          onClick={() => removeBusFilter(filter.id)}
                          className="p-1 hover:bg-gray-100 rounded text-red-500"
                          aria-label={`Remove filter for bus ${filter.number}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      
                      {editingFilter === filter.id && (
                        <div className="absolute mt-2 bg-white rounded-lg shadow-lg z-30 min-w-[200px] border">
                          <div className="p-3 border-b bg-gray-50">
                            <strong>Set Direction</strong>
                          </div>
                          <div 
                            className="p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleDirectionSelect(filter.id, '')}
                          >
                            All Directions
                          </div>
                          <div 
                            className="p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleDirectionSelect(filter.id, 'Genève-Aéroport, Terminal')}
                          >
                            Genève-Aéroport, Terminal
                          </div>
                          <div 
                            className="p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleDirectionSelect(filter.id, 'Genève, Rive')}
                          >
                            Genève, Rive
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-gray-700">Time Filter</h3>
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center max-w-[200px]">
                    <input
                      type="time"
                      value={timeInput}
                      onChange={handleTimeFilterChange}
                      className="p-2 pl-9 border border-gray-300 rounded-md text-sm w-full bg-white"
                      aria-label="Time filter"
                    />
                    <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  
                  {isUpdating && (
                    <span className="text-sm text-gray-500 animate-pulse ml-2" aria-live="polite">
                      Updating...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};