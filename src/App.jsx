import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import CSVHandler from './components/CSVHandler';
import FetchData from './components/FetchData';
import DataDisplay from './components/DataDisplay';
import MintegralDataTable from './components/MintegralDataTable';
import DataComprehensed from './components/DataComprehensed'
// import MintegralTable from './components/MintegralTable';
import MintegralDateSpendTable from './components/MintegralDataSpendTable';
import CountryDataSpend from './components/CountryDataSpend';
import GamewiseCountrySpend from './components/GamewiseCountrySpend';
import Comparator from './components/Comparator';
import SpendOverview from './components/SpendOverview';


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
          <Route path="/mintegral-date-spend" element={<MintegralDateSpendTable />} />
          <Route path="/date-country-spend" element={<CountryDataSpend/>} />
          <Route path='/game-country-spend' element = {<GamewiseCountrySpend/>}/>
          <Route path='/comparator' element = {<Comparator/>}/>
          <Route path='/spend-overview' element = {<SpendOverview/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
