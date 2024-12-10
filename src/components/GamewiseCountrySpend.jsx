// GameCountrySpend.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar'; 

const GameCountrySpend = () => {
  const [gameNames, setGameNames] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [spendData, setSpendData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [countryData, setCountryData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [totalSpent, setTotalSpent] = useState(0); 
  const [viewMode, setViewMode] = useState('date-wise'); 

  useEffect(() => {
    fetchGameData();
  }, []);

  useEffect(() => {
    // console.log('Selected Game:', selectedGame);
    if (selectedGame) {
        console.log("Got selected game: ", selectedGame);
        
      processFilteredData();
      processCountryData();
    } else {
      setFilteredData([]);
      setCountryData([]);
      setTotalSpent(0);
    }
  }, [selectedGame, spendData, viewMode]);

  const fetchGameData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://backend-five-kohl-26.vercel.app/api/mintegral/spend');
      const rawData = response.data.data;

      const gameSet = new Set();
      const processedData = rawData.map((item) => {
        const previewLink = item.preview_link;
        const gameName = extractGameName(previewLink);
        // console.log(gameName);
        gameSet.add(gameName);
  
        return {
          ...item,
          gameName,
          spend: parseFloat(item.spend) || 0,
          date: item.date || 'Unknown',
          location: item.location || 'Unknown',
        };
      });
  
      setGameNames(Array.from(gameSet));
      setSpendData(processedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const extractGameName = (link) => {
    const base = 'https://apps.apple.com/us/app/';
    if (link && link.startsWith(base)) {
      const namePart = link.slice(base.length);
      //   console.log(namePart);
      
      const idIndex = namePart.lastIndexOf('/id');
      if (idIndex !== -1) {
        const gameName = namePart.slice(0, idIndex).replace(/-/g, ' ');
        console.log('Extracted Game Name:', gameName); // Debugging Log
        
        const capitalizedGameName = gameName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return capitalizedGameName;
      }
    }
    return 'Unknown Game';
  };

  const processFilteredData = () => {

    const filtered = spendData.filter(
      (item) =>
        item.gameName &&
        item.gameName.trim().toLowerCase() === selectedGame.trim().toLowerCase()
    );
  
    console.log('Selected Game:', selectedGame.trim().toLowerCase());
    console.log('Filtered Data:', filtered);
  
    const dateCountrySpendMap = {};
    let total = 0; 
  
    filtered.forEach((item) => {
      const date = item.date;
      const country = item.location;
      const spend = item.spend;
  
      total += spend;
  
      if (!dateCountrySpendMap[date]) {
        dateCountrySpendMap[date] = {};
      }
  
      if (!dateCountrySpendMap[date][country]) {
        dateCountrySpendMap[date][country] = 0;
      }
      dateCountrySpendMap[date][country] += spend;
    });

    const processedData = Object.entries(dateCountrySpendMap)
      .map(([date, countries]) => ({
        date,
        countries: Object.entries(countries)
          .map(([country, spend]) => ({
            country,
            spend: Number(spend.toFixed(2)),
          }))
          .filter((country) => country.spend > 0),
      }))
      .filter((item) => item.countries.length > 0);
  
    setFilteredData(processedData);
    setTotalSpent(total.toFixed(2)); 

    console.log('Total Spent:', total.toFixed(2));
    console.log('Processed Data:', processedData);
  };

  const processCountryData = () => {
    const filtered = spendData.filter(
      (item) =>
        item.gameName &&
        item.gameName.trim().toLowerCase() === selectedGame.trim().toLowerCase()
    );
  
    console.log('Country-wise Filtered Data:', filtered);
  
    const countrySpendMap = {};
    let total = 0;
  
    filtered.forEach((item) => {
      const country = item.location;
      const spend = item.spend;
      total += spend;
  
      if (countrySpendMap[country]) {
        countrySpendMap[country] += spend;
      } else {
        countrySpendMap[country] = spend;
      }
    });
  
    const processedCountryData = Object.entries(countrySpendMap)
      .map(([country, spend]) => ({
        country,
        spend: Number(spend.toFixed(2)),
      }))
      .filter((item) => item.spend > 0)
      .sort((a, b) => b.spend - a.spend);
  
    setCountryData(processedCountryData);
    setTotalSpent(total.toFixed(2)); 
  
    console.log('Total Country Spend:', total.toFixed(2));
    console.log('Processed Country Data:', processedCountryData);
  };

  const sortedData = React.useMemo(() => {
    let sortableData = viewMode === 'date-wise' ? [...filteredData] : [...countryData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (sortConfig.key === 'date' || sortConfig.key === 'country') {
          const aKey = a[sortConfig.key] ? a[sortConfig.key].toLowerCase() : '';
          const bKey = b[sortConfig.key] ? b[sortConfig.key].toLowerCase() : '';
          
          if (sortConfig.key === 'date') {
            return sortConfig.direction === 'ascending'
              ? new Date(aKey) - new Date(bKey)
              : new Date(bKey) - new Date(aKey);
          } else {
            return sortConfig.direction === 'ascending'
              ? aKey.localeCompare(bKey)
              : bKey.localeCompare(aKey);
          }
        }
        if (sortConfig.key === 'spend') {
          return sortConfig.direction === 'ascending' ? a.spend - b.spend : b.spend - a.spend;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, countryData, sortConfig, viewMode]);

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

  const handleViewMode = (mode) => {
    setViewMode(mode);
    setSortConfig({ key: mode === 'date-wise' ? 'date' : 'country', direction: 'ascending' });
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />

      <h1 className="text-2xl font-bold mb-4">Game Country-wise Spend</h1>

        <div className="mb-4">
        <label htmlFor="game-select" className="mr-2 font-medium">
            Select Game:
        </label>
        <select
            id="game-select"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="px-3 py-2 border rounded"
        >
            <option value="">-- Select a Game --</option>
            {gameNames.map((name, index) => (
            <option key={index} value={name}>
                {name}
            </option>
            ))}
        </select>
        </div>

      {selectedGame && (
        <div className="mb-4">
          <button
            onClick={() => handleViewMode('date-wise')}
            className={`px-4 py-2 mr-2 rounded ${
              viewMode === 'date-wise'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Date-wise
          </button>
          <button
            onClick={() => handleViewMode('country-wise')}
            className={`px-4 py-2 rounded ${
              viewMode === 'country-wise'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Country-wise
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center mt-10">Loading...</div>
      ) : selectedGame ? (
        viewMode === 'date-wise' ? (
          currentData.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Date-wise Country Spend for {selectedGame}
              </h2>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th
                      onClick={() => requestSort('date')}
                      className="py-2 px-4 border-b bg-gray-100 text-left text-sm font-semibold cursor-pointer"
                    >
                      Date
                      {sortConfig.key === 'date' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}</span>
                      )}
                    </th>
                    <th className="py-2 px-4 border-b bg-gray-100 text-left text-sm font-semibold">
                      Country-wise Spend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b text-sm">{item.date}</td>
                      <td className="py-2 px-4 border-b text-sm">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {item.countries
                            .sort((a, b) => b.spend - a.spend)
                            .map((countryData, idx) => (
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

              <div className="mt-4 text-right">
                <span className="text-lg font-semibold">
                  Total Spent: ${totalSpent}
                </span>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 mx-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 mx-1">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 mx-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>No data available for the selected game.</p>
          )
        ) : countryData.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Country-wise Total Spend for {selectedGame}
            </h2>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th
                    onClick={() => requestSort('country')}
                    className="py-2 px-4 border-b bg-gray-100 text-left text-sm font-semibold cursor-pointer"
                  >
                    Country
                    {sortConfig.key === 'country' && (
                      <span>{sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th
                    onClick={() => requestSort('spend')}
                    className="py-2 px-4 border-b bg-gray-100 text-left text-sm font-semibold cursor-pointer"
                  >
                    Total Spent
                    {sortConfig.key === 'spend' && (
                      <span>{sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b text-sm">{item.country}</td>
                    <td className="py-2 px-4 border-b text-sm">${item.spend}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 text-right">
              <span className="text-lg font-semibold">
                Total Spent: ${totalSpent}
              </span>
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 mx-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 mx-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 mx-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p>No data available for the selected game.</p>
        )
      ) : (
        <p>Please select a game to view the spend data.</p>
      )}
    </div>
  );
};

export default GameCountrySpend;