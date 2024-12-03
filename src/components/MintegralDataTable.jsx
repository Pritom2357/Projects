import React, { useEffect, useState } from "react";
import axios from "axios";

const MintegralDataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/mintegral");
        setData(response.data.data.lists); 
        console.log(response.data.data.lists); 
        
        setLoading(false);
      } catch (error) {
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (!data.length) return <div>No data available</div>;

  const formatDate = (dateString) => {
    const dateStr = String(dateString); 

    if (dateStr.length === 8) {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);

    return `${day.trim()}/${month}/${year}`;
    } else {
      return "Invalid Date"; 
    }
  };

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto shadow-xl rounded-lg border-gray-200 bg-white p-4">
      <table className="min-w-full table-auto text-sm">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-2 text-left font-semibold text-gray-700">
                {header.charAt(0).toUpperCase() + header.slice(1).replace("_", " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b">
              {headers.map((header, idx) => (
                <td key={idx} className="px-4 py-2 text-gray-800">
                  {/* Format the date if the header is "date" */}
                  {header === "date" ? formatDate(row[header]) : row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MintegralDataTable;
