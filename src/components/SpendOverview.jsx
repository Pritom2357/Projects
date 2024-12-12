import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const PACKAGE_MAPPING = {
  'com.tapmonkey.dinovillage2014': 'id739067593',
  'com.funvai.policevsthief': 'id1542502766',
  'com.fpg.jseattack': 'id1535441769'
};

const GAME_NAMES = {
  'com.tapmonkey.dinovillage2014': 'Dino Water World-Dinosaur game',
  'com.funvai.policevsthief': 'Police vs Thief 3D - car race',
  'com.fpg.jseattack': 'Jurassic Sniper 3D'
};

const SpendOverview = () => {
  const [dateWiseData, setDateWiseData] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const [mintegralResponse, applovinResponse] = await Promise.all([
          axios.get('https://backend-five-kohl-26.vercel.app/api/mintegral/spend'),
          fetch('https://backend-five-kohl-26.vercel.app/api/applovin').then(res => res.json())
        ]);

        const processedApplovin = {};
        applovinResponse.results
          .filter(item => {
            const itemDate = new Date(item.day);
            return itemDate >= sevenDaysAgo && 
                   itemDate <= today && 
                   Object.keys(PACKAGE_MAPPING).includes(item.package_name);
          })
          .forEach(item => {
            if (!processedApplovin[item.day]) {
              processedApplovin[item.day] = {};
            }
            processedApplovin[item.day][item.package_name] = {
              revenue: parseFloat(item.estimated_revenue) || 0,
              spend: 0,
              profit: parseFloat(item.estimated_revenue) || 0
            };
          });

        mintegralResponse.data.data
          .filter(item => Object.values(PACKAGE_MAPPING).includes(item.package_name))
          .forEach(item => {
            const applovinPackageName = Object.entries(PACKAGE_MAPPING)
              .find(([_, mintegralId]) => mintegralId === item.package_name)?.[0];
            
            if (applovinPackageName && processedApplovin[item.date]?.[applovinPackageName]) {
              const spend = parseFloat(item.spend) || 0;
              processedApplovin[item.date][applovinPackageName].spend = spend;
              processedApplovin[item.date][applovinPackageName].profit = 
                processedApplovin[item.date][applovinPackageName].revenue - spend;
            }
          });

        setDateWiseData(processedApplovin);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedDates = React.useMemo(() => {
    return Object.keys(dateWiseData).sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? new Date(a) - new Date(b)
        : new Date(b) - new Date(a);
    });
  }, [dateWiseData, sortConfig]);

  const currentDates = sortedDates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      {/* <div className="mb-4 flex justify-center space-x-4">
        <button
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
        </button>
      </div> */}

      <h1 className="text-2xl font-bold mb-4">Date-wise Overview</h1>
      
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th onClick={() => setSortConfig({
                  key: 'date',
                  direction: sortConfig.direction === 'ascending' ? 'descending' : 'ascending'
                })} 
                className="cursor-pointer py-2 px-4 border-b">
                  Date {sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}
                </th>
                <th className="py-2 px-4 border-b">Game Details</th>
              </tr>
            </thead>
            <tbody>
              {currentDates.map(date => (
                <tr key={date} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b align-top">{date}</td>
                  <td className="py-2 px-4 border-b">
                    <div className="space-y-4">
                      {Object.entries(dateWiseData[date] || {}).map(([packageName, data]) => (
                        <div key={packageName} className="bg-gray-50 p-3 rounded">
                          <div className="font-medium mb-2">{GAME_NAMES[packageName]}</div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              Revenue: <span className="text-blue-600">${data.revenue.toFixed(2)}</span>
                            </div>
                            <div>
                              Spend: <span className="text-orange-600">${data.spend.toFixed(2)}</span>
                            </div>
                            <div>
                              Profit: <span className={data.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                ${data.profit.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
              Page {currentPage} of {Math.ceil(sortedDates.length / itemsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(sortedDates.length / itemsPerPage), p + 1))}
              disabled={currentPage === Math.ceil(sortedDates.length / itemsPerPage)}
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

export default SpendOverview;