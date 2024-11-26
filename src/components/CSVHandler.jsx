import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import Bar from './Bar';

function CSVHandler() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('/data.csv')
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setData(result.data);
            setIsLoading(false);
          },
        });
      })
      .catch((error) => {
        console.log('Error loading CSV: ', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      {isLoading ? (
        <p>Loading data, please wait...</p>
      ) : (
        <div>
            {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
            <Bar data={data} />
        </div>
      )}
    </div>
  );
}

export default CSVHandler;
