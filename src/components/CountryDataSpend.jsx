// MintegralDateCountrySpend.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const MintegralDateCountrySpend = () => {
  const [spendData, setSpendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpendData();
  }, []);

  const fetchSpendData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://backend-five-kohl-26.vercel.app/api/mintegral');
      const rawData = response.data.data;
  
      // Process and aggregate data by date and country
      const dateCountrySpendMap = {};
  
      rawData.forEach(item => {
        const date = item.date || 'Unknown';
        const spend = parseFloat(item.spend) || 0;
        const countries = item.geo || ['Unknown'];
        const spendPerCountry = spend / countries.length;
  
        if (!dateCountrySpendMap[date]) {
          dateCountrySpendMap[date] = {};
        }
  
        countries.forEach(country => {
          if (!dateCountrySpendMap[date][country]) {
            dateCountrySpendMap[date][country] = 0;
          }
          dateCountrySpendMap[date][country] += spendPerCountry;
        });
      });
  
      // Convert to array and filter out zero spend countries
      const processedData = Object.entries(dateCountrySpendMap)
        .map(([date, countries]) => ({
          date,
          countries: Object.entries(countries)
            .map(([country, spend]) => ({
              country,
              spend: Number(spend.toFixed(2))
            }))
            .filter(country => country.spend > 0) // Remove zero spend
        }))
        .filter(item => item.countries.length > 0); // Remove dates with no spending countries
  
      setSpendData(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Sorting logic
  const sortedData = React.useMemo(() => {
    let sortableData = [...spendData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (sortConfig.key === 'date') {
          return sortConfig.direction === 'ascending'
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        return 0;
      });
    }
    return sortableData;
  }, [spendData, sortConfig]);

  // Pagination
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
      {/* Navigation Button */}
      <div className="mb-4">
        {/* <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Main Table
        </button> */}
        <Navbar/>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-center">
        Date-wise Country Spend Report
      </h1>

      {loading ? (
        <div className="text-center mt-10">Loading...</div>
      ) : (
        currentData && currentData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th
                    onClick={() => requestSort('date')}
                    className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                  >
                    Date
                    {sortConfig.key === 'date' && (
                      <span>{sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    Country-wise Spend
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                      {item.date}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {item.countries.sort((a, b) => b.spend - a.spend).map((countryData, idx) => (
                          <div 
                            key={idx}
                            className="bg-gray-50 p-2 rounded border border-gray-200"
                          >
                            <span className="font-medium">{countryData.country}:</span>
                            <span className="ml-2">${countryData.spend}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 mx-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 mx-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 mx-1 bg-gray-300 rounded disabled:opacity-50"
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

export default MintegralDateCountrySpend;