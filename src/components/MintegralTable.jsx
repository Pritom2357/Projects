// MintegralTable.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const MintegralTable = () => {
  const [mintegralData, setMintegralData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const navigate = useNavigate();


  const fetchMintegralData = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('https://backend-five-kohl-26.vercel.app/api/mintegral', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      const rawData = response.data.data;
      console.log(response);
      

      // Process and aggregate data
      const countryWiseData = {};

      rawData.forEach((item) => {
        const geoArray = item.geo || ['Unknown'];
        const spend = parseFloat(item.spend) || 0;
        console.log(spend);
        

        geoArray.forEach((country) => {
        if (countryWiseData[country]) {
            countryWiseData[country] += spend;
        } else {
            countryWiseData[country] = spend;
        }
        });
      });

      const aggregatedData = Object.entries(countryWiseData).map(([country, spend]) => ({
        country,
        spend: spend.toFixed(2),
      }));

      aggregatedData.sort((a, b) => b.spend - a.spend);

      setMintegralData(aggregatedData);
    } catch (error) {
      console.error('Error fetching Mintegral data:', error);
    }
    setLoading(false);
  };

  // Sorting logic
  const sortedData = React.useMemo(() => {
    let sortableData = [...mintegralData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === 'spend') {
          return sortConfig.direction === 'ascending'
            ? parseFloat(aValue) - parseFloat(bValue)
            : parseFloat(bValue) - parseFloat(aValue);
        }

        return sortConfig.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }
    return sortableData;
  }, [mintegralData, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Date Range Inputs */}
      <Navbar/>
      <div className="mb-4 flex items-center">
        <label className="mr-2">Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-2 py-1 mr-4"
        />
        <label className="mr-2">End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-2 py-1 mr-4"
        />
        <button
          onClick={fetchMintegralData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Fetch Data
        </button>
        {/* <button
        onClick={() => navigate('/')}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
        >
        Back to Main Table
        </button> */}
      </div>

      {loading ? (
        <div className="text-center mt-10">Loading...</div>
      ) : (
        currentData && currentData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  {['country', 'spend'].map((key) => (
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
                    <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                      {item.country}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                      {item.spend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 mx-1 bg-gray-300 rounded"
              >
                Previous
              </button>
              <span className="px-3 py-1 mx-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 mx-1 bg-gray-300 rounded"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p>No data available.</p>
        )
      )}
    </div>
  );
};

export default MintegralTable;