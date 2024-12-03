// DataDisplay.jsx

import React, { useEffect, useState } from 'react';
import { openDB } from 'idb';

const DataDisplay = () => {
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); 
  const [itemsPerPage] = useState(100); 
  const [dataSource, setDataSource] = useState('applovin');

  const initDB = async () => {
    const db = await openDB('MyDatabase', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('apiData')) {
          db.createObjectStore('apiData');
        }
      },
    });
    return db;
  };

  const fetchDataAndStore = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/data');
      const jsonData = await response.json();
      const results = jsonData.results;

      const db = await initDB();
      await db.put('apiData', results, 'data');
      await db.put('apiData', new Date().getTime(), 'timestamp');

      setData(results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const getDataFromDB = async () => {

      const db = await initDB();
      const storedData = await db.get('apiData', 'data');
      const timestamp = await db.get('apiData', 'timestamp');

      const now = new Date().getTime();
      const expiryTime = 24 * 60 * 60 * 1000; 

      if (storedData && timestamp && now - timestamp < expiryTime) {
        setData(storedData);
        setLoading(false);
      } else {
        fetchDataAndStore();
      }
    };

    getDataFromDB();
  }, []);

  const refreshData = () => {
    const clearDB = async () => {
      const db = await initDB();
      await db.delete('apiData', 'data');
      await db.delete('apiData', 'timestamp');

      setLoading(true);
      fetchDataAndStore();
    };

    clearDB();
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbersToShow = 5; 
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxPageNumbersToShow / 2)
    );
    let endPage = startPage + maxPageNumbersToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageNumbersToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Data from API</h1>
      <button
        onClick={refreshData}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
      >
        Refresh Data
      </button>
      {currentData && currentData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {Object.keys(currentData[0]).map((key) => (
                  <th
                    key={key}
                    className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700"
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  {Object.keys(item).map((key) => (
                    <td
                      key={key}
                      className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700"
                    >
                      {key === 'day'
                        ? new Date(item[key]).toLocaleDateString()
                        : item[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available.</p>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        {/* Previous Button */}
        <button
          onClick={() => paginate(currentPage - 1)}
          className={`px-4 py-2 mx-1 border rounded ${
            currentPage === 1
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'
          }`}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {/* First Page */}
        {currentPage > 3 && (
          <>
            <button
              onClick={() => paginate(1)}
              className={`px-4 py-2 mx-1 border rounded ${
                currentPage === 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'
              }`}
            >
              1
            </button>
            {currentPage > 4 && <span className="px-2">...</span>}
          </>
        )}

        {/* Page Numbers */}
        {generatePageNumbers().map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-4 py-2 mx-1 border rounded ${
              currentPage === number
                ? 'bg-blue-500 text-white'
                : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'
            }`}
          >
            {number}
          </button>
        ))}

        {/* Last Page */}
        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && <span className="px-2">...</span>}
            <button
              onClick={() => paginate(totalPages)}
              className={`px-4 py-2 mx-1 border rounded ${
                currentPage === totalPages
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => paginate(currentPage + 1)}
          className={`px-4 py-2 mx-1 border rounded ${
            currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'
          }`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DataDisplay;
