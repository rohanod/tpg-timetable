import { Printer, Trash2, Settings } from 'lucide-react';
import { StopSchedule } from '../types';
import { TimetableTable } from './TimetableTable';
import { useAppContext } from '../contexts/AppContext';
import html2canvas from 'html2canvas';

interface TimetablePageProps {
  id: string;
  stopName: string;
  theme: 'color' | 'bw';
  data: StopSchedule[];
  onRemove: () => void;
  onPrint: (isBw: boolean) => void;
  onThemeChange: (theme: 'color' | 'bw') => void;
}

export const TimetablePage: React.FC<TimetablePageProps> = ({
  id,
  stopName,
  theme,
  data,
  onRemove,
  onPrint,
  onThemeChange,
}) => {
  const { selectedTimetable, setSelectedTimetable } = useAppContext();

  const exportAsImage = async () => {
    const element = document.getElementById(`timetable-page-${id}`);
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        onclone: (clonedDoc) => {
          const actions = clonedDoc.querySelector(`#timetable-page-${id} .page-actions`);
          if (actions) actions.style.display = 'none';
        }
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      const safeStopName = stopName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `timetable-${safeStopName || 'export'}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Error exporting image:", error);
      alert("Could not export image. See console for details.");
    }
  };

  const handlePrint = (isBw: boolean) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Timetable - ${stopName}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 1cm;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
              background: white;
            }
            .timetable-container {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              border: 2px solid ${isBw ? '#333' : '#f97316'};
              border-radius: 8px;
              overflow: hidden;
              background: white;
            }
            .stop-name {
              padding: 15px;
              font-size: 24px;
              font-weight: 600;
              text-align: center;
              border-bottom: 1px solid #ddd;
              background: white;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
            }
            th {
              background: ${isBw ? '#333' : '#f97316'};
              color: white;
              padding: 12px;
              text-align: center;
              font-size: 14px;
            }
            td {
              padding: 12px;
              border: 1px solid ${isBw ? '#333' : '#e5e7eb'};
              font-size: 14px;
            }
            tr:nth-child(even) {
              background: ${isBw ? '#f0f0f0' : '#f9fafb'};
            }
            tr:nth-child(odd) {
              background: white;
            }
            .footer {
              padding: 12px;
              border-top: 1px solid #ddd;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #666;
              background: white;
            }
            @media print {
              body {
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print { display: none; }
              .timetable-container {
                border: none;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="timetable-container">
            <div class="stop-name">${stopName}</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 25%">Time</th>
                  <th style="width: 25%">Bus/Tram Number</th>
                  <th style="width: 50%; text-align: left">Destination</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(item => `
                  <tr>
                    <td style="text-align: center">${item.time}</td>
                    <td style="text-align: center">${item.busNumber}</td>
                    <td>${item.destination}</td>
                  </tr>
                `).join('')}
                ${data.length === 0 ? `
                  <tr>
                    <td colspan="3" style="text-align: center; color: #666">
                      No departures found.
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
            <div class="footer">
              <span>tpg.rohanodwyer.com</span>
              <span>${new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="
              padding: 10px 20px;
              background: #f97316;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
              transition: background-color 0.2s;
            ">
              Print Timetable
            </button>
            <p style="margin-top: 10px; color: #666; font-size: 14px;">
              Click the button above or press Ctrl/Cmd + P to print
            </p>
            ">
              Print Timetable
            </button>
          </div>
          <script>
            // Print dialog on load with slight delay
            window.onload = () => setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const isSelected = selectedTimetable === id;
  
  return (
    <div
      id={`timetable-page-${id}`}
      className={`timetable-page border-2 ${theme === 'bw' ? 'border-gray-700' : 'border-orange-500'} rounded-lg mb-6 bg-white overflow-hidden shadow-lg transition-all duration-300 ${isSelected ? 'ring-2 ring-orange-300' : ''}`}
      data-theme={theme}
      data-id={id}
      data-testid={`timetable-${id}`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          {stopName}
        </h2>
        <button
          onClick={() => setSelectedTimetable(isSelected ? null : id)}
          className={`p-2 rounded-full transition-colors ${isSelected ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100 text-gray-600'}`}
          aria-label={isSelected ? "Hide settings" : "Show settings"}
          title="Toggle settings"
        >
          <Settings size={20} />
        </button>
      </div>
      
      <div className="table-container overflow-x-auto">
        <TimetableTable data={data} theme={theme} />
      </div>
      
      <div className={`page-footer flex justify-between items-center p-4 ${theme === 'bw' ? 'bg-gray-100' : 'bg-gray-50'} border-t border-gray-300`}>
        <span className="watermark text-xs text-gray-500">tpg.rohanodwyer.com</span>
        
        <div className="page-actions flex flex-wrap gap-2">
          <button
            onClick={() => handlePrint(false)}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm flex items-center gap-1.5 transition-colors"
            aria-label="Print in color"
          >
            <Printer size={16} /> Print Color
          </button>
          
          <button
            onClick={() => handlePrint(true)}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm flex items-center gap-1.5 transition-colors"
            aria-label="Print in black and white"
          >
            <Printer size={16} /> Print B&W
          </button>
          
          <button
            onClick={exportAsImage}
            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-md text-sm flex items-center gap-1.5 transition-colors"
            aria-label="Export as image"
          >
            Export Image
          </button>
          
          <button
            onClick={onRemove}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm flex items-center gap-1.5 transition-colors"
            aria-label="Remove timetable"
          >
            <Trash2 size={16} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
};