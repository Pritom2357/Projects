import React, { useEffect, useState } from 'react';
import { openDB } from 'idb';
import axios from 'axios';

const DataDisplayMintegral = () => {
  const [applovinData, setApplovinData] = useState([]);
  const [mintegralData, setMintegralData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [dataSource, setDataSource] = useState('applovin');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

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

  const fetchApplovinData = async () => {
    try {
      const response = await fetch('https://backend-five-kohl-26.vercel.app/api/applovin');
      const jsonData = await response.json();
      const results = jsonData.results;

      const db = await initDB();
      await db.put('apiData', results, 'applovinData');
      await db.put('apiData', new Date().getTime(), 'timestamp');

      setApplovinData(results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Applovin data:', error);
      setLoading(false);
    }
  };

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

  useEffect(() => {
    const getDataFromDB = async () => {
      const db = await initDB();
      const storedApplovinData = await db.get('apiData', 'applovinData');
      const timestamp = await db.get('apiData', 'timestamp');

      const now = new Date().getTime();
      const expiryTime = 24 * 60 * 60 * 1000; // 24 hours

      if (storedApplovinData && timestamp && now - timestamp < expiryTime) {
        setApplovinData(storedApplovinData);
        setLoading(false);
      } else {
        fetchApplovinData();
      }
    };

    getDataFromDB();
    fetchMintegralData();
  }, []);

  // useEffect(()=>{
  //   setSortConfig({key:null, direction:'ascending'});
  //   setCurrentPage(1);
  // }, [dataSource])

  const refreshData = () => {
    const clearDB = async () => {
      const db = await initDB();
      await db.delete('apiData', 'applovinData');
      await db.delete('apiData', 'timestamp');

      setLoading(true);
      fetchApplovinData();
    };

    clearDB();
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...(dataSource === 'applovin' ? applovinData : mintegralData)];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        // Handle different data types
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }

        // If values are dates in string format
        if (sortConfig.key.toLowerCase() === 'date') {
          const aDate = new Date(formatDate(aValue));
          const bDate = new Date(formatDate(bValue));
          return sortConfig.direction === 'ascending' ? aDate - bDate : bDate - aDate;
        }

        // Default to string comparison
        return sortConfig.direction === 'ascending'
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      });
    }
    return sortableData;
  }, [applovinData, mintegralData, sortConfig, dataSource]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = sortedData.slice(indexOfFirstItem, indexOfLastItem);

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

  const formatDate = (dateString) => {
    const dateStr = String(dateString);
    if (dateStr.length === 8) {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      return `${month}/${day}/${year}`; // Changed to MM/DD/YYYY for Date parsing
    } else {
      return "Invalid Date";
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
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
          className={`bg-blue-500 text-white px-4 py-2 rounded mb-2 mr-4 hover:bg-blue-600 ${dataSource === 'applovin' ? 'opacity-75' : ''}`}
        >
          Show Applovin Data
        </button>
        <button
          onClick={() => setDataSource('mintegral')}
          className={`bg-blue-500 text-white px-4 py-2 rounded mb-2 hover:bg-blue-600 ${dataSource === 'mintegral' ? 'opacity-75' : ''}`}
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
                    onClick={() => requestSort(key)}
                    className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortConfig.key === key ? (
                      sortConfig.direction === 'ascending' ? (
                        <span> ▲</span>
                      ) : (
                        <span> ▼</span>
                      )
                    ) : null}
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
