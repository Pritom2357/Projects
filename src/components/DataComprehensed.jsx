import React, { useEffect, useState } from 'react';
import { openDB } from 'idb';
import axios from 'axios';

const DataDisplayMintegral = () => {
  const [applovinData, setApplovinData] = useState([]);
  const [mintegralData, setMintegralData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [itemsPerPage] = useState(100); // Number of items per page
  const [dataSource, setDataSource] = useState('applovin'); // 'applovin' or 'mintegral'

  // Initialize IndexedDB
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

  // Function to fetch Applovin data
  const fetchApplovinData = async () => {
    try {
      const response = await fetch('https://backend-five-kohl-26.vercel.app/api/applovin');
      const jsonData = await response.json();
      const results = jsonData.results;

      // Store data in IndexedDB
      const db = await initDB();
      await db.put('apiData', results, 'applovinData');
      await db.put('apiData', new Date().getTime(), 'timestamp');

      // Update state
      setApplovinData(results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Applovin data:', error);
      setLoading(false);
    }
  };

  // Function to fetch Mintegral data
  const fetchMintegralData = async () => {
    try {
      const response = await axios.get("https://backend-five-kohl-26.vercel.app/api/mintegral");
      const data = response.data.data.lists;

      setMintegralData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Mintegral data:', error);
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const getDataFromDB = async () => {
      const db = await initDB();
      const storedApplovinData = await db.get('apiData', 'applovinData');
      const timestamp = await db.get('apiData', 'timestamp');

      const now = new Date().getTime();
      const expiryTime = 24 * 60 * 60 * 1000; // 24 hours

      if (storedApplovinData && timestamp && now - timestamp < expiryTime) {
        // Use stored Applovin data
        setApplovinData(storedApplovinData);
        setLoading(false);
      } else {
        // Fetch new Applovin data
        fetchApplovinData();
      }
    };

    getDataFromDB();
    fetchMintegralData(); // Mintegral data is fetched on mount as well
  }, []);

  // Function to refresh data
  const refreshData = () => {
    const clearDB = async () => {
      const db = await initDB();
      await db.delete('apiData', 'applovinData');
      await db.delete('apiData', 'timestamp');

      // Fetch new Applovin data
      setLoading(true);
      fetchApplovinData();
    };

    clearDB();
  };

  // Get total pages for pagination
  const totalPages = Math.ceil((dataSource === 'applovin' ? applovinData : mintegralData).length / itemsPerPage);

  // Get current data for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = (dataSource === 'applovin' ? applovinData : mintegralData).slice(indexOfFirstItem, indexOfLastItem);

  // Change page function
  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination controls
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

  // Format date (if available)
  const formatDate = (dateString) => {
    const dateStr = String(dateString);
    if (dateStr.length === 8) {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      return `${day}-${month}-${year.slice(-2)}`; // Format as dd-mm-yy
    } else {
      return "Invalid Date";
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Data from API</h1>
      
      {/* Data Source Switch */}
      <div className="mb-4">
        <button
          onClick={() => setDataSource('applovin')}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-2 mr-4 hover:bg-blue-600"
        >
          Show Applovin Data
        </button>
        <button
          onClick={() => setDataSource('mintegral')}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-2 hover:bg-blue-600"
        >
          Show Mintegral Data
        </button>
      </div>

      <button
        onClick={refreshData}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
      >
        Refresh Data
      </button>

        <h1 className="text-3xl text-blue-700 text-center p-8">
        {dataSource === "applovin" ? "Applovin Data" : "Mintegral Data"}
        </h1>

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
                        style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {key.toLowerCase() === 'date' && dataSource === 'mintegral'
                          ? formatDate(String(item[key]))
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
        <button
          onClick={() => paginate(currentPage - 1)}
          className={`px-4 py-2 mx-1 border rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'}`}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {currentPage > 3 && (
          <>
            <button
              onClick={() => paginate(1)}
              className={`px-4 py-2 mx-1 border rounded ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'}`}
            >
              1
            </button>
            {currentPage > 4 && <span className="px-2">...</span>}
          </>
        )}

        {generatePageNumbers().map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-4 py-2 mx-1 border rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'}`}
          >
            {number}
          </button>
        ))}

        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && <span className="px-2">...</span>}
            <button
              onClick={() => paginate(totalPages)}
              className={`px-4 py-2 mx-1 border rounded ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'}`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => paginate(currentPage + 1)}
          className={`px-4 py-2 mx-1 border rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'}`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DataDisplayMintegral;
