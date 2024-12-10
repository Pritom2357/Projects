import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import CSVHandler from './components/CSVHandler';
import FetchData from './components/FetchData';
import DataDisplay from './components/DataDisplay';
import MintegralDataTable from './components/MintegralDataTable';
import DataComprehensed from './components/DataComprehensed'
import MintegralTable from './components/mintegralTable';
import MintegralDateSpendTable from './components/MintegralDataSpendTable';
import CountryDataSpend from './components/CountryDataSpend';
import GamewiseCountrySpend from './components/GamewiseCountrySpend';


function App() {
  return (
    <div>
      {/* <CSVHandler /> */}
      {/* <FetchData/> */}
      {/* <DataDisplay/> */}
      {/* <MintegralDataTable/> */}
      {/* <DataComprehensed/> */}

      <Router>
        <Routes>
          <Route path='/' element={<DataComprehensed />} />
          <Route path='/mintegral-table' element={<MintegralTable />} />
          <Route path="/mintegral-date-spend" element={<MintegralDateSpendTable />} />
          <Route path="/date-country-spend" element={<CountryDataSpend/>} />
          <Route path='/game-country-spend' element = {<GamewiseCountrySpend/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
