import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar as ChartBar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Bar = ({ data }) => {
  const [chartData, setChartData] = useState(null);
  const [uniqueGames, setUniqueGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');

  useEffect(() => {
    const games = Array.from(new Set(data.map((row) => row.Application)));
    setUniqueGames(['All Games', ...games]); // Add "All Games" option
    if (games.length > 0) setSelectedGame('All Games'); // Default to "All Games"
  }, [data]);

  useEffect(() => {
    if (selectedGame) {
      if (selectedGame === 'All Games') {
        const gameOccurrences = data.reduce((acc, row) => {
          acc[row.Application] = (acc[row.Application] || 0) + 1;
          return acc;
        }, {});

        setChartData({
          labels: Object.keys(gameOccurrences),
          datasets: [
            {
              label: 'Total Occurrences of All Games',
              data: Object.values(gameOccurrences),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
      } else {
        const filteredData = data.filter((row) => row.Application === selectedGame);
        const statsByDay = filteredData.reduce((acc, row) => {
          acc[row.Day] = (acc[row.Day] || 0) + 1;
          return acc;
        }, {});

        setChartData({
          labels: Object.keys(statsByDay),
          datasets: [
            {
              label: `Occurrences of ${selectedGame}`,
              data: Object.values(statsByDay),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
      }
    }
  }, [selectedGame, data]);

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Bar Chart: Game Statistics
      </h2>
      <div className="flex justify-center mb-6">
        <label htmlFor="game-select" className="mr-4 font-medium text-gray-700">
          Select a Game:
        </label>
        <select
          id="game-select"
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
        >
          {uniqueGames.map((game, idx) => (
            <option key={idx} value={game}>
              {game}
            </option>
          ))}
        </select>
      </div>
      {chartData && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <ChartBar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  labels: {
                    color: '#4B5563',
                    font: {
                      size: 14,
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: '#4B5563',
                    font: {
                      size: 12,
                    },
                  },
                  grid: {
                    color: '#E5E7EB',
                  },
                },
                y: {
                  ticks: {
                    color: '#4B5563',
                    font: {
                      size: 12,
                    },
                  },
                  grid: {
                    color: '#E5E7EB',
                  },
                },
              },
            }}
            height={400}
          />
        </div>
      )}
    </div>
  );
};

export default Bar;
