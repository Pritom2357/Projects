import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const PACKAGE_MAPPING = {
  'com.tapmonkey.dinovillage2014': 'id739067593',
  'com.funvai.policevsthief': 'id1542502766',
  'com.fpg.jseattack': 'id1535441769'
};

const Comparator = () => {
  const [mintegralData, setMintegralData] = useState([]);
  const [applovinData, setApplovinData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const mintegralResponse = await axios.get('https://backend-five-kohl-26.vercel.app/api/mintegral/spend');
        const processedMintegralData = mintegralResponse.data.data.map(item => ({
          date: item.date || 'N/A',
          package_name: item.package_name || 'N/A',
          spend: parseFloat(item.spend) || 0
        }));
        setMintegralData(processedMintegralData);
        console.log("Mintegral Data", processedMintegralData);

        const applovinResponse = await fetch('https://backend-five-kohl-26.vercel.app/api/applovin');
        const applovinJson = await applovinResponse.json();
        
        const processedApplovinData = applovinJson.results
          .filter(item => {
            const itemDate = new Date(item.day);
            return itemDate >= sevenDaysAgo && itemDate <= today;
          })
          .map(item => ({
            date: item.day || 'N/A',
            package_name: item.package_name || 'N/A',
            revenue: parseFloat(item.estimated_revenue) || 0
          }));
        setApplovinData(processedApplovinData);
        console.log("Processed Applovin Data", processedApplovinData);

        const summary = {};
        
        processedApplovinData.forEach(item => {
          const key = `${item.date}_${item.package_name}`;
          if (!summary[key]) {
            summary[key] = {
              date: item.date,
              package_name: item.package_name,
              revenue: 0,
              spend: 0,
              profit: 0
            };
          }
            summary[key].revenue += parseFloat(item.revenue) || 0;
            summary[key].profit = summary[key].revenue;
        });

        processedMintegralData.forEach(item => {
        const applovinPackageName = Object.entries(PACKAGE_MAPPING)
          .find(([_, mintegralId]) => mintegralId === item.package_name)?.[0];
        
        if (applovinPackageName) {
          const key = `${item.date}_${applovinPackageName}`;
          if (summary[key]) {
            const spend = parseFloat(item.spend) || 0;
            summary[key].spend = spend;

            summary[key].profit = summary[key].revenue - spend;
          }
        }
      });

        setSummaryData(Object.values(summary));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    const data = [...summaryData];
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (sortConfig.key === 'date') {
          return sortConfig.direction === 'ascending'
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        return sortConfig.direction === 'ascending'
          ? a[sortConfig.key] - b[sortConfig.key]
          : b[sortConfig.key] - a[sortConfig.key];
      });
    }
    return data;
  }, [summaryData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="mb-4 flex justify-center space-x-4">
        {/* <button
          onClick={() => navigate('/comparator')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View All Data
        </button>
        <button
          onClick={() => navigate('/spend-overview')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View Overview
        </button> */}
      </div>
      <h1 className="text-2xl font-bold mb-4">Summary Report</h1>
      
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th onClick={() => requestSort('date')} className="cursor-pointer py-2 px-4 border-b">
                  Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                </th>
                <th onClick={() => requestSort('package_name')} className="cursor-pointer py-2 px-4 border-b">
                  Package Name {sortConfig.key === 'package_name' && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                </th>
                <th onClick={() => requestSort('revenue')} className="cursor-pointer py-2 px-4 border-b">
                  Total Revenue {sortConfig.key === 'revenue' && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                </th>
                <th onClick={() => requestSort('spend')} className="cursor-pointer py-2 px-4 border-b">
                  Total Spend {sortConfig.key === 'spend' && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                </th>
                <th onClick={() => requestSort('profit')} className="cursor-pointer py-2 px-4 border-b">
                  Total Profit {sortConfig.key === 'profit' && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">{item.date}</td>
                  <td className="py-2 px-4 border-b">{item.package_name}</td>
                  <td className="py-2 px-4 border-b text-right">${item.revenue.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b text-right">${item.spend.toFixed(2)}</td>
                  <td className={`py-2 px-4 border-b text-right ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${item.profit.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 mx-1 bg-gray-300 rounded"
            >
              Previous
            </button>
            <span className="px-3 py-1 mx-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 mx-1 bg-gray-300 rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comparator;