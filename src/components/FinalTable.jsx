import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Navbar from './Navbar'; 
import ReactCountryFlag from 'react-country-flag';

const PACKAGE_MAPPING = {
  'com.tapmonkey.dinovillage2014': 'id739067593',
  'com.funvai.policevsthief': 'id1542502766',
  'com.fpg.jseattack': 'id1535441769',
};

const GAME_NAMES = {
  'com.tapmonkey.dinovillage2014': 'Dino Water World-Dinosaur game',
  'com.funvai.policevsthief': 'Police vs Thief 3D - car race',
  'com.fpg.jseattack': 'Jurassic Sniper 3D',
};

const formatRoas = (roas) => {
  if (roas === 0 || !isFinite(roas)) {
    return 'INFINITY';
  }
  return roas.toFixed(2);
};

const calculateNetRoas = (groupedDataArray) => {
  const netRoasSum = groupedDataArray.reduce((sum, item) => {
    return sum + (isFinite(item.roas) && item.roas > 0 ? item.roas : 0);
  }, 0);
  return netRoasSum === 0 ? 'INFINITY' : netRoasSum.toFixed(2);
};

const NestedCountryTable = ({ countries }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'roas', direction: 'descending' });

  const handleSort = (key) => {
    setSortConfig((prevSortConfig) => {
      if (prevSortConfig.key === key) {
        return {
          key,
          direction: prevSortConfig.direction === 'ascending' ? 'descending' : 'ascending',
        };
      } else {
        return { key, direction: 'ascending' };
      }
    });
  };

  const sortedCountries = useMemo(() => {
    let sortableCountries = [...countries];
    if (sortConfig.key) {
      sortableCountries.sort((a, b) => {
        if (sortConfig.key === 'country') {
          return sortConfig.direction === 'ascending'
            ? a.country.localeCompare(b.country)
            : b.country.localeCompare(a.country);
        } else {
          return sortConfig.direction === 'ascending'
            ? a[sortConfig.key] - b[sortConfig.key]
            : b[sortConfig.key] - a[sortConfig.key];
        }
      });
    }
    return sortableCountries;
  }, [countries, sortConfig]);

  return (
    <table className="min-w-full bg-gray-200 border rounded mb-4">
      <thead>
        <tr>
          <th
            onClick={() => handleSort('country')}
            className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
          >
            Country {sortConfig.key === 'country' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
          </th>
          <th
            onClick={() => handleSort('revenue')}
            className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
          >
            Revenue {sortConfig.key === 'revenue' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
          </th>
          <th
            onClick={() => handleSort('spend')}
            className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
          >
            Spend {sortConfig.key === 'spend' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
          </th>
          <th
            onClick={() => handleSort('roas')}
            className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
          >
            ROAS {sortConfig.key === 'roas' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedCountries.map((country, index) => {
          const countryCode = country.country.toUpperCase();
          return (
            <tr key={index} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b flex items-center justify-center">
                <ReactCountryFlag
                  countryCode={countryCode}
                  svg
                  style={{
                    width: '1.5em',
                    height: '1.5em',
                    marginRight: '0.5em',
                  }}
                  title={country.country}
                />
                <span>{country.country.toUpperCase()}</span>
              </td>
              <td className="py-2 px-4 border-b text-center">${country.revenue.toFixed(2)}</td>
              <td className="py-2 px-4 border-b text-center">${country.spend.toFixed(2)}</td>
              <td className="py-2 px-4 border-b text-center">{formatRoas(country.roas)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const CustomDataTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'roas', direction: 'descending' });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    gameName: '',
    countryName: '',
  });
  const [pendingFilters, setPendingFilters] = useState({
    startDate: '',
    endDate: '',
    gameName: '',
    countryName: '',
  });
  const [loading, setLoading] = useState(true);
  const [countryNames, setCountryNames] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mintegralResponse, applovinResponse] = await Promise.all([
          axios.get('https://backend-five-kohl-26.vercel.app/api/mintegral/spend'),
          axios.get('https://backend-five-kohl-26.vercel.app/api/applovin'),
        ]);

        const applovinData = applovinResponse.data.results
          .map((item) => ({
            date: item.day,
            package_name: item.package_name,
            game_name: GAME_NAMES[item.package_name] || 'Unknown Game',
            country: item.country || 'Unknown',
            revenue: parseFloat(item.estimated_revenue) || 0,
          }))
          .filter((item) => item.game_name !== 'Unknown Game'); 

        const mintegralData = mintegralResponse.data.data
          .map((item) => {
            const applovinPackageName = Object.entries(PACKAGE_MAPPING).find(
              ([_, minPkg]) => minPkg === item.package_name
            )?.[0];

            if (!applovinPackageName) return null;

            return {
              date: item.date,
              package_name: applovinPackageName,
              country: item.location || 'Unknown',
              spend: parseFloat(item.spend) || 0,
            };
          })
          .filter((item) => item !== null); 

        const mergedData = applovinData.map((appItem) => {
          const mintegralMatches = mintegralData.filter(
            (minItem) =>
              minItem.date === appItem.date &&
              minItem.package_name === appItem.package_name &&
              minItem.country === appItem.country
          );

          const totalSpend = mintegralMatches.reduce((sum, item) => sum + item.spend, 0);

          return {
            ...appItem,
            spend: totalSpend,
            roas: totalSpend > 0 ? appItem.revenue / totalSpend : Infinity, 
          };
        });

        setData(mergedData);
        setFilteredData(mergedData);

        const countriesSet = new Set(mergedData.map((item) => item.country));
        setCountryNames(Array.from(countriesSet).sort());

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePendingFilterChange = (e) => {
    setPendingFilters({ ...pendingFilters, [e.target.name]: e.target.value });
  };

  const handleShowClick = () => {
    setFilters(pendingFilters);
  };

  useEffect(() => {
    let tempData = [...data];

    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      tempData = tempData.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    if (filters.gameName) {
      tempData = tempData.filter((item) => item.game_name === filters.gameName);
    }

    if (filters.countryName) {
      tempData = tempData.filter(
        (item) => item.country.toLowerCase() === filters.countryName.toLowerCase()
      );
    }

    setFilteredData(tempData);
  }, [filters, data]);

  const sortedData = useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (['revenue', 'spend', 'roas'].includes(sortConfig.key)) {
          return sortConfig.direction === 'ascending'
            ? a[sortConfig.key] - b[sortConfig.key]
            : b[sortConfig.key] - a[sortConfig.key];
        } else {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prevSortConfig) => {
      if (prevSortConfig.key === key) {
        return {
          key,
          direction: prevSortConfig.direction === 'ascending' ? 'descending' : 'ascending',
        };
      } else {
        return { key, direction: 'ascending' };
      }
    });
  };

  const renderTable = () => {
    if (
      filters.startDate &&
      filters.endDate &&
      !filters.gameName
    ) {
      const groupedData = sortedData.reduce((acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = { revenue: 0, spend: 0, roas: 0 };
        }
        acc[item.date].revenue += item.revenue;
        acc[item.date].spend += item.spend;
        acc[item.date].roas += isFinite(item.roas) && item.roas > 0 ? item.roas : 0; 
        return acc;
      }, {});

      const groupedDataArray = Object.entries(groupedData).map(
        ([date, values]) => ({
          date,
          revenue: values.revenue,
          spend: values.spend,
          roas: values.roas,
        })
      );

      const netRoas = calculateNetRoas(groupedDataArray);

      const sortedGroupedDataArray = [...groupedDataArray].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });

      return (
        <table className="min-w-full bg-white border mb-4">
          <thead>
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                Date {sortConfig.key === 'date' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('revenue')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                Revenue {sortConfig.key === 'revenue' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('spend')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                Spend {sortConfig.key === 'spend' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('roas')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                ROAS {sortConfig.key === 'roas' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedGroupedDataArray.map((item) => (
              <tr key={item.date} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-center">{item.date}</td>
                <td className="py-2 px-4 border-b text-center">${item.revenue.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-center">${item.spend.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-center">{formatRoas(item.roas)}</td>
              </tr>
            ))}
            <tr className="hover:bg-gray-100 font-bold">
              <td className="py-2 px-4 border-t" colSpan="4">
                NET ROAS
              </td>
              <td className="py-2 px-4 border-t text-center">
                {netRoas}
              </td>
            </tr>
          </tbody>
        </table>
      );
    }
    else if (
      filters.startDate &&
      filters.endDate &&
      filters.gameName &&
      filters.countryName
    ) {
      const groupedData = sortedData.reduce((acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = { revenue: 0, spend: 0, roas: 0 };
        }
        acc[item.date].revenue += item.revenue;
        acc[item.date].spend += item.spend;
        acc[item.date].roas += isFinite(item.roas) && item.roas > 0 ? item.roas : 0; 
        return acc;
      }, {});

      const groupedDataArray = Object.entries(groupedData).map(
        ([date, values]) => ({
          date,
          revenue: values.revenue,
          spend: values.spend,
          roas: values.roas,
        })
      );

      const netRoas = calculateNetRoas(groupedDataArray);

      const sortedGroupedDataArray = [...groupedDataArray].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });

      return (
        <table className="min-w-full bg-white border mb-4">
          <thead>
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                Date {sortConfig.key === 'date' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('revenue')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                Revenue {sortConfig.key === 'revenue' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('spend')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                Spend {sortConfig.key === 'spend' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('roas')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                ROAS {sortConfig.key === 'roas' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th className="py-2 px-4 border-b bg-gray-300 text-center">
                NET ROAS
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedGroupedDataArray.map((item) => (
              <tr key={item.date} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-center">{item.date}</td>
                <td className="py-2 px-4 border-b text-center">${item.revenue.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-center">${item.spend.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-center">{formatRoas(item.roas)}</td>
                <td className="py-2 px-4 border-b text-center"></td>
              </tr>
            ))}
            <tr className="hover:bg-gray-100 font-bold">
              <td className="py-2 px-4 border-t" colSpan="4">
                NET ROAS
              </td>
              <td className="py-2 px-4 border-t text-center">
                {netRoas}
              </td>
            </tr>
          </tbody>
        </table>
      );
    }
    else if (
      filters.startDate &&
      filters.endDate &&
      filters.gameName &&
      !filters.countryName
    ) {
      const groupedData = sortedData.reduce((acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = {
            games: [],
            netRevenue: 0,
            netSpend: 0,
            netRoas: 0,
          };
        }
        acc[item.date].games.push({
          country: item.country,
          revenue: item.revenue,
          spend: item.spend,
          roas: item.roas,
        });
        acc[item.date].netRevenue += item.revenue;
        acc[item.date].netSpend += item.spend;
        acc[item.date].netRoas += isFinite(item.roas) && item.roas > 0 ? item.roas : 0;
        return acc;
      }, {});

      const groupedDataArray = Object.entries(groupedData).map(
        ([date, values]) => ({
          date,
          games: values.games,
          netRevenue: values.netRevenue,
          netSpend: values.netSpend,
          netRoas: values.netRoas,
        })
      );

      const netRoas = calculateNetRoas(groupedDataArray);

      const sortedGroupedDataArray = [...groupedDataArray].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });

      return (
        <table className="min-w-full bg-white border mb-4">
          <thead>
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                Date {sortConfig.key === 'date' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th className="py-2 px-4 border-b bg-gray-300 text-center">Country Details</th>
              <th className="py-2 px-4 border-b bg-gray-300 text-center">
                NET ROAS
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedGroupedDataArray.map((item) => (
              <tr key={item.date} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-center">{item.date}</td>
                <td className="py-2 px-4 border-b">
                  <NestedCountryTable countries={item.games} />
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {item.netRoas === 0 ? 'INFINITY' : item.netRoas.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="hover:bg-gray-100 font-bold">
              <td className="py-2 px-4 border-t" colSpan="2">
                NET ROAS
              </td>
              <td className="py-2 px-4 border-t text-center">
                {netRoas}
              </td>
            </tr>
          </tbody>
        </table>
      );
    }
    else if (filters.gameName && filters.countryName) {
      const groupedData = sortedData.reduce((acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = { revenue: 0, spend: 0 };
        }
        acc[item.date].revenue += item.revenue;
        acc[item.date].spend += item.spend;
        return acc;
      }, {});

      const groupedDataArray = Object.entries(groupedData).map(
        ([date, values]) => ({
          date,
          revenue: values.revenue,
          spend: values.spend,
          roas: values.spend > 0 ? values.revenue / values.spend : Infinity,
        })
      );

      const netRoas = groupedDataArray.reduce((sum, item) => {
        return sum + (isFinite(item.roas) && item.roas > 0 ? item.roas : 0);
      }, 0);
      const netRoasDisplay = netRoas === 0 ? 'INFINITY' : netRoas.toFixed(2);

      const sortedGroupedDataArray = [...groupedDataArray].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });

      return (
        <table className="min-w-full bg-white border mb-4">
          <thead>
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                Date {sortConfig.key === 'date' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('revenue')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                Revenue {sortConfig.key === 'revenue' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('spend')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                Spend {sortConfig.key === 'spend' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('roas')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                ROAS {sortConfig.key === 'roas' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedGroupedDataArray.map((item) => (
              <tr key={item.date} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-center">{item.date}</td>
                <td className="py-2 px-4 border-b text-center">${item.revenue.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-center">${item.spend.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-center">{formatRoas(item.roas)}</td>
              </tr>
            ))}
            <tr className="hover:bg-gray-100 font-bold">
              <td className="py-2 px-4 border-t" colSpan="3">
                NET ROAS
              </td>
              <td className="py-2 px-4 border-t text-center">
                {netRoasDisplay}
              </td>
            </tr>
          </tbody>
        </table>
      );
    }
    else {
      const groupedData = sortedData.reduce((acc, item) => {
        const key = filters.countryName ? item.country : item.game_name;
        if (!acc[key]) {
          acc[key] = { revenue: 0, spend: 0, roas: 0 };
        }
        acc[key].revenue += item.revenue;
        acc[key].spend += item.spend;
        acc[key].roas += isFinite(item.roas) && item.roas > 0 ? item.roas : 0; 
        return acc;
      }, {});

      const groupedDataArray = Object.entries(groupedData).map(([key, values]) => ({
        key,
        revenue: values.revenue,
        spend: values.spend,
        roas: values.roas,
      }));

      const netRoas = groupedDataArray.reduce((sum, item) => sum + item.roas, 0);
      const netRoasDisplay = netRoas === 0 ? 'INFINITY' : netRoas.toFixed(2);

      const sortedGroupedDataArray = [...groupedDataArray].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });

      return (
        <table className="min-w-full bg-white border mb-4">
          <thead>
            <tr>
              <th
                onClick={() => handleSort(filters.countryName ? 'country' : 'game_name')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                {filters.countryName ? 'Country' : 'Game Name'}{' '}
                {sortConfig.key === (filters.countryName ? 'country' : 'game_name') ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('revenue')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                Revenue {sortConfig.key === 'revenue' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('spend')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                Spend {sortConfig.key === 'spend' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('roas')}
                className="py-2 px-4 border-b cursor-pointer bg-gray-300 text-center"
              >
                ROAS {sortConfig.key === 'roas' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedGroupedDataArray.map((item) => (
              <tr key={item.key} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-center">{item.key}</td>
                <td className="py-2 px-4 border-b text-center">${item.revenue.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-center">${item.spend.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-center">{formatRoas(item.roas)}</td>
              </tr>
            ))}
            <tr className="hover:bg-gray-100 font-bold">
              <td className="py-2 px-4 border-t" colSpan="3">
                NET ROAS
              </td>
              <td className="py-2 px-4 border-t text-center">
                {netRoasDisplay}
              </td>
            </tr>
          </tbody>
        </table>
      );
    };
   };

  const gameNames = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.game_name))).sort();
  }, [data]);

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4 text-center">Custom Data Table</h1>
      <div className="mb-4 flex flex-wrap gap-4 justify-center">
        <div>
          <label className="block mb-1 text-center">Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={pendingFilters.startDate}
            onChange={handlePendingFilterChange}
            className="border px-2 py-1 rounded text-center"
          />
        </div>

        <div>
          <label className="block mb-1 text-center">End Date:</label>
          <input
            type="date"
            name="endDate"
            value={pendingFilters.endDate}
            onChange={handlePendingFilterChange}
            className="border px-2 py-1 rounded text-center"
          />
        </div>

        <div>
          <label className="block mb-1 text-center">Game Name:</label>
          <select
            name="gameName"
            value={pendingFilters.gameName}
            onChange={handlePendingFilterChange}
            className="border px-2 py-1 rounded text-center"
          >
            <option value="">All Games</option>
            {gameNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-center">Country Code:</label>
          <select
            name="countryName"
            value={pendingFilters.countryName}
            onChange={handlePendingFilterChange}
            className="border px-2 py-1 rounded text-center"
          >
            <option value="">All Countries</option>
            {countryNames.map((code, index) => (
              <option key={index} value={code}>
                {code.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={handleShowClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
        >
          Show
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : filteredData.length === 0 ? (
        <div className="text-center">No data available for the selected filters.</div>
      ) : (
        renderTable()
      )}
    </div>
  );
};

export default CustomDataTable;
