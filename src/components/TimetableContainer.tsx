import { useEffect } from 'react';
import { TimetablePage } from './TimetablePage';
import { useAppContext } from '../contexts/AppContext';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Plus } from 'lucide-react';
import { useAddTimetable, useDeleteTimetable, useUpdateTimetable } from '../services/projects';
import { Timetable } from '../types';
import { toast } from 'react-hot-toast';

interface TimetableContainerProps {
  setIsPrinting: (isPrinting: boolean) => void;
  projectId?: string;
  initialTimetables?: Timetable[];
}

export const TimetableContainer: React.FC<TimetableContainerProps> = ({ 
  setIsPrinting, 
  projectId,
  initialTimetables = []
}) => {
  const { 
    timetablePages, 
    removeTimetablePage, 
    updateTimetablePage,
    filteredData,
    addTimetablePage,
    setTimetablePages
  } = useAppContext();

  const addTimetableMutation = useAddTimetable();
  const updateTimetableMutation = useUpdateTimetable();
  const deleteTimetableMutation = useDeleteTimetable();

  // Load timetables from project if projectId is provided
  useEffect(() => {
    if (projectId && initialTimetables.length > 0) {
      // Convert database timetables to the format expected by the app
      const formattedTimetables = initialTimetables.map(t => ({
        id: t.id || t._id,
        stopName: t.stopName,
        stopId: t.stopId,
        theme: t.theme as 'color' | 'bw',
        data: t.data || []
      }));
      setTimetablePages(formattedTimetables);
    }
  }, [projectId, initialTimetables, setTimetablePages]);

  const handleRemovePage = async (id: string) => {
    if (projectId) {
      try {
        // Delete from database first
        await deleteTimetableMutation({ timetableId: id });
        // Then remove from UI if deletion was successful
        removeTimetablePage(id);
        toast.success('Timetable deleted');
      } catch (error) {
        console.error('Error deleting timetable:', error);
        toast.error('Failed to delete timetable');
      }
    } else {
      removeTimetablePage(id);
    }
  };

  const handlePrintPage = (id: string, isBw: boolean) => {
    const pageToPrint = timetablePages.find(page => page.id === id);
    if (!pageToPrint) return;
    
    const originalTheme = pageToPrint.theme;
    
    // Temporarily update the theme for printing
    updateTimetablePage(id, { theme: isBw ? 'bw' : 'color' });
    
    setTimeout(() => {
      setIsPrinting(true);
      window.print();
      
      // Reset theme after printing
      setTimeout(() => {
        updateTimetablePage(id, { theme: originalTheme });
      }, 500);
    }, 100);
  };

  const handleThemeChange = async (id: string, theme: 'color' | 'bw') => {
    updateTimetablePage(id, { theme });
    
    if (projectId) {
      try {
        await updateTimetableMutation({
          timetableId: id,
          updates: { theme }
        });
      } catch (error) {
        console.error('Error updating timetable theme:', error);
        toast.error('Failed to save theme preference');
      }
    }
  };

  const handleNewPage = async () => {
    if (projectId) {
      try {
        // Free users can only create up to 3 timetables per project
        if (timetablePages.length >= 3) {
          toast.error('You can only create up to 3 timetables per project');
          return;
        }

        // For projects, create a new empty timetable
        const newPage = {
          stopName: 'Select a stop...',
          stopId: '',
          theme: 'color' as const,
          data: []
        };
        
        // Create the timetable in the database
        const result = await addTimetableMutation({
          projectId,
          timetable: newPage
        });
        
        if (result) {
          // Add the timetable to the UI with the database ID
          addTimetablePage({
            id: result.id,
            stopName: result.stopName,
            stopId: result.stopId,
            theme: result.theme as 'color' | 'bw',
            data: result.data || []
          });
          toast.success('New timetable created');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to create timetable');
      }
    } else {
      // For standalone mode, create a demo timetable
      const demoData = [
        { time: '09:05', busNumber: '12', destination: 'Central Station' },
        { time: '09:15', busNumber: '7', destination: 'City Hall' },
        { time: '09:25', busNumber: '12', destination: 'Central Station' },
        { time: '09:30', busNumber: '15', destination: 'University' },
        { time: '09:45', busNumber: '7', destination: 'City Hall' }
      ];
      
      addTimetablePage({
        id: `temp-${Date.now()}`,
        stopName: 'Demo Stop',
        stopId: 'demo',
        theme: 'color',
        data: demoData
      });
    }
  };

  return (
    <div className="timetables-wrapper flex-1 overflow-y-auto p-2 sm:px-4 sm:pb-4 min-h-0 print:p-0 print:overflow-visible">
      {timetablePages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p className="mb-4">No timetables yet</p>
          <button
            onClick={handleNewPage}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center gap-2 transition-colors"
            data-testid="add-first-timetable"
          >
            <Plus size={20} /> Add Timetable
          </button>
        </div>
      ) : (
        <TransitionGroup className="transition-group">
          {timetablePages.map(page => (
            <CSSTransition
              key={page.id}
              timeout={300}
              classNames="page-transition"
            >
              <TimetablePage
                key={page.id}
                id={page.id}
                stopName={page.stopName}
                theme={page.theme}
                data={filteredData[page.id] || []}
                onRemove={() => handleRemovePage(page.id)}
                onPrint={(isBw) => handlePrintPage(page.id, isBw)}
                onThemeChange={(theme) => handleThemeChange(page.id, theme)}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
      )}
    </div>
  );
};