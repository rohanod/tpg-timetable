import { useAppContext } from '../contexts/AppContext';

export const PrintArea: React.FC = () => {
  const { timetablePages, filteredData } = useAppContext();
  
  return (
    <div id="printArea" className="hidden print:block">
      {timetablePages.map(page => (
        <div 
          key={page.id}
          className={`timetable-page-print mb-8 page-break-after ${page.theme === 'bw' ? 'print-bw-active' : 'print-color-active'}`}
        >
          <h2 className="stop-title-print text-center font-semibold text-xl p-3 border-b border-gray-300">
            {page.stopName}
          </h2>
          
          <table className="w-full border-collapse table-print">
            <thead>
              <tr>
                <th className="th-print p-2 text-center border border-gray-300 w-1/4">Time</th>
                <th className="th-print p-2 text-center border border-gray-300 w-1/4">Bus Number</th>
                <th className="th-print p-2 text-left border border-gray-300 w-2/4">Destination</th>
              </tr>
            </thead>
            <tbody>
              {(filteredData[page.id] || []).map((item, index) => (
                <tr 
                  key={`print-${page.id}-${index}`}
                  className={index % 2 === 0 ? 'tr-even-print' : 'tr-odd-print'}
                >
                  <td className="td-print p-2 text-center border border-gray-300">
                    {item.time}
                  </td>
                  <td className="td-print p-2 text-center border border-gray-300">
                    {item.busNumber}
                  </td>
                  <td className="td-print p-2 text-left border border-gray-300">
                    {item.destination}
                  </td>
                </tr>
              ))}
              {(filteredData[page.id] || []).length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    No departures found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="page-footer-print flex justify-between items-center p-3 border-t border-gray-300">
            <span className="watermark-print text-xs text-gray-500">tpg.rohanodwyer.com</span>
            <span className="text-xs text-gray-500">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};