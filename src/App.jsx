import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import emojiFlags from 'emoji-flags';

function App() {

  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectheaders, setSelectHeaders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 500;

  const fetchCSVData = async () => {
    try {
      const response = await fetch('/data.csv');
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = Object.keys(results.data[0]);
          setTableHeaders(headers);
          setSelectHeaders(headers);
          setTableData(results.data);
        },
      });
    } catch (error) {
      console.log('Error while fetching data: ', error);
    }
  };

  useEffect(() => {
    fetchCSVData();
  }, []);

  const idxLastRow = currentPage * rowsPerPage;
  const idxFirstRow = idxLastRow - rowsPerPage;
  const currentRows = tableData.slice(idxFirstRow, idxLastRow);

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev * rowsPerPage < tableData.length ? prev + 1 : prev));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const toggleHeaderSelection = (header) => {
    setSelectHeaders((prev) => {
      if (prev.includes(header)) {
        return prev.filter((h) => h !== header);
      } else {
        const updatedHeaders = [...prev, header];
        return tableHeaders.filter((h) => updatedHeaders.includes(h));
      }
    });
  };


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Game Data</h1>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Select Columns:</h3>
        <div className="flex flex-wrap gap-4">
          {tableHeaders.map((header) => (
            <label key={header} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectheaders.includes(header)}
                onChange={() => toggleHeaderSelection(header)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-gray-700">{header}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              {selectheaders.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left text-gray-700 font-semibold border border-gray-300">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
              >
                {selectheaders.map((header, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 border border-gray-300 text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                     {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page <strong>{currentPage}</strong>
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage * rowsPerPage >= tableData.length}
          className={`px-4 py-2 rounded-lg ${
            currentPage * rowsPerPage >= tableData.length
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
