import React, { useEffect } from 'react';
import { TimetablePage } from './TimetablePage';
import { useAppContext } from '../contexts/AppContext';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Plus } from 'lucide-react';
import { ProjectService } from '../services/projects';
import { toast } from 'react-hot-toast';

interface TimetableContainerProps {
  setIsPrinting: (isPrinting: boolean) => void;
  projectId?: string;
}

export const TimetableContainer: React.FC<TimetableContainerProps> = ({ setIsPrinting, projectId }) => {
  const { 
    timetablePages, 
    removeTimetablePage, 
    updateTimetablePage,
    filteredData,
    addTimetablePage,
    setTimetablePages
  } = useAppContext();

  // Load timetables from project if projectId is provided
  useEffect(() => {
    if (projectId) {
      loadTimetables();
    }
  }, [projectId]);

  const loadTimetables = async () => {
    try {
      const timetables = await ProjectService.getTimetables(projectId as string);
      if (timetables.length > 0) {
        setTimetablePages(timetables);
      }
    } catch (error) {
      console.error('Error loading timetables:', error);
    }
  };

  const handleRemovePage = async (id: string) => {
    removeTimetablePage(id);
    
    if (projectId) {
      try {
        await ProjectService.deleteTimetable(id);
      } catch (error) {
        console.error('Error deleting timetable:', error);
        toast.error('Failed to delete timetable from server');
      }
    }
  };

  const handlePrintPage = (id: string, isBw: boolean) => {
    const pageToPrint = timetablePages.find(page => page.id === id);
    if (!pageToPrint) return;
    
    const originalTheme = pageToPrint.theme;
    
    updateTimetablePage(id, { theme: isBw ? 'bw' : 'color' });
    
    setTimeout(() => {
      setIsPrinting(true);
      window.print();
      
      setTimeout(() => {
        updateTimetablePage(id, { theme: originalTheme });
      }, 500);
    }, 100);
  };

  const handleThemeChange = async (id: string, theme: 'color' | 'bw') => {
    updateTimetablePage(id, { theme });
    
    if (projectId) {
      try {
        await ProjectService.updateTimetable(id, { theme });
      } catch (error) {
        console.error('Error updating timetable theme:', error);
      }
    }
  };

  const handleAddTimetable = async () => {
    if (projectId) {
      try {
        const { data: userProfile } = await ProjectService.getUserPermissions();
        
        if (!userProfile.is_premium && timetablePages.length >= 3) {
          toast.error('Free users can only create up to 3 timetables per project. Upgrade to premium for unlimited timetables.');
          return;
        }
        
        const newPage = {
          id: `page-${Date.now()}`,
          stopName: 'Select a stop...',
          stopId: '',
          theme: 'color',
          data: []
        };
        
        addTimetablePage(newPage);
        await ProjectService.addTimetable(projectId, newPage);
      } catch (error: any) {
        toast.error(error.message);
      }
    } else {
      addTimetablePage();
    }
  };

  return (
    <div className="timetables-wrapper flex-1 overflow-y-auto p-2 sm:px-4 sm:pb-4 min-h-0 print:p-0 print:overflow-visible">
      {timetablePages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p className="mb-4">No timetables yet</p>
          <button
            onClick={handleAddTimetable}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center gap-2 transition-colors"
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