import { useEffect, useState } from 'react';
import { TimetablePage } from './TimetablePage';
import { useAppContext } from '../contexts/AppContext';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Plus } from 'lucide-react';
import { ProjectService } from '../services/projects';
import { toast } from 'react-hot-toast';
import { Timetable } from '../types';

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

  const [savingTimetables, setSavingTimetables] = useState<Record<string, boolean>>({});

  // Load timetables from project if projectId is provided
  useEffect(() => {
    if (projectId && initialTimetables.length > 0) {
      // Convert database timetables to the format expected by the app
      const formattedTimetables = initialTimetables.map(t => ({
        id: t.id,
        stopName: t.stopName,
        stopId: t.stopId,
        theme: t.theme as 'color' | 'bw',
        data: t.data || []
      }));
      setTimetablePages(formattedTimetables);
    }
  }, [projectId, initialTimetables]);

  const handleRemovePage = async (id: string) => {
    if (projectId) {
      try {
        // Delete from database first
        await ProjectService.deleteTimetable(id);
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

  const handleSaveTimetable = async (id: string) => {
    if (!projectId) return;

    const timetable = timetablePages.find(p => p.id === id);
    if (!timetable) return;

    setSavingTimetables(prev => ({ ...prev, [id]: true }));

    try {
      await ProjectService.updateTimetable(id, {
        stopName: timetable.stopName,
        stopId: timetable.stopId,
        theme: timetable.theme,
        data: timetable.data
      });
      toast.success('Timetable saved successfully');
    } catch (error) {
      console.error('Error saving timetable:', error);
      toast.error('Failed to save timetable');
    } finally {
      setSavingTimetables(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleThemeChange = async (id: string, theme: 'color' | 'bw') => {
    updateTimetablePage(id, { theme });
  };

  const handleNewPage = async () => {
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
                onThemeChange={(theme) => handleThemeChange(page.id, theme)}
                onSave={projectId ? () => handleSaveTimetable(page.id) : undefined}
                isSaving={savingTimetables[page.id]}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
      )}
    </div>
  );
};