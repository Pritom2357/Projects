// DataDisplayMintegral.jsx

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
      const response = await axios.get('https://backend-five-kohl-26.vercel.app/api/mintegral');
      const data = response.data.data;
      console.log('Mintegral data: ', data);

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

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }

        if (sortConfig.key.toLowerCase() === 'date') {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          return sortConfig.direction === 'ascending' ? aDate - bDate : bDate - aDate;
        }

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
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
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

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getDisplayedColumns = (dataSource) => {
    if (dataSource === 'mintegral') {
      return ['date', 'spend', 'package_name', 'geo', 'platform'];
    }
    return Object.keys(currentData[0]);
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
          className={`bg-blue-500 text-white px-4 py-2 rounded mb-2 mr-4 hover:bg-blue-600 ${
            dataSource === 'applovin' ? 'opacity-75' : ''
          }`}
        >
          Show Applovin Data
        </button>
        <button
          onClick={() => setDataSource('mintegral')}
          className={`bg-blue-500 text-white px-4 py-2 rounded mb-2 hover:bg-blue-600 ${
            dataSource === 'mintegral' ? 'opacity-75' : ''
          }`}
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
        {dataSource === 'applovin' ? 'Applovin Data' : 'Mintegral Data'}
      </h1>

      {currentData && currentData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {getDisplayedColumns(dataSource).map((key) => (
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
                <tr key={index} className="hover:bg-gray-100 overflow-visible">
                  {getDisplayedColumns(dataSource).map((key) => (
                    <td
                      key={key}
                      className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700 relative overflow-visible"
                    >
                      {dataSource === 'mintegral' && key === 'geo' ? (
                        item.geo && item.geo.length > 0 ? (
                          <div className="relative group">
                            <span className="cursor-pointer">
                              {item.geo[0]} {item.geo.length > 1 && '...'}
                            </span>
                            {item.geo.length > 1 && (
                              <div
                                className="invisible group-hover:visible absolute left-0 z-50
                                bg-gray-800 text-white p-2 rounded shadow-lg min-w-[150px]
                                whitespace-normal bottom-full mb-2"
                              >
                                {item.geo.map((country, idx) => (
                                  <div key={idx} className="py-1">
                                    {country}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          'N/A'
                        )
                      ) : (
                        item[key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6">
            {currentPage > 1 && (
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-l-md"
                onClick={() => paginate(currentPage - 1)}
              >
                Prev
              </button>
            )}
            {generatePageNumbers().map((number) => (
              <button
                key={number}
                className={`px-4 py-2 bg-gray-200 text-gray-800 ${
                  number === currentPage ? 'bg-blue-500 text-white' : ''
                } rounded-md`}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            ))}
            {currentPage < totalPages && (
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-r-md"
                onClick={() => paginate(currentPage + 1)}
              >
                Next
              </button>
            )}
          </div>
        </div>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default DataDisplayMintegral;