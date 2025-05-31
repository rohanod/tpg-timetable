import React from 'react';
import { StopSchedule } from '../types';

interface TimetableTableProps {
  data: StopSchedule[];
  theme: 'color' | 'bw';
}

export const TimetableTable: React.FC<TimetableTableProps> = ({ data, theme }) => {
  const headerClasses = theme === 'bw' 
    ? 'bg-gray-800 text-white' 
    : 'bg-orange-500 text-white';

  const cellBorderClasses = theme === 'bw'
    ? 'border-gray-400'
    : 'border-gray-300';

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className={`p-3 text-center text-sm border ${cellBorderClasses} ${headerClasses} w-1/4`}>
            Time
          </th>
          <th className={`p-3 text-center text-sm border ${cellBorderClasses} ${headerClasses} w-1/4`}>
            Bus/Tram Number
          </th>
          <th className={`p-3 text-left text-sm border ${cellBorderClasses} ${headerClasses} w-2/4`}>
            Destination
          </th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr 
              key={`${item.time}-${item.busNumber}-${index}`}
              className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <td className={`p-3 text-sm border ${cellBorderClasses} text-center`}>
                {item.time}
              </td>
              <td className={`p-3 text-sm border ${cellBorderClasses} text-center`}>
                {item.busNumber}
              </td>
              <td className={`p-3 text-sm border ${cellBorderClasses} text-left`}>
                {item.destination}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3} className="p-4 text-center text-gray-500">
              {data.length === 0 ? 'No departures found.' : 'Loading schedule...'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};