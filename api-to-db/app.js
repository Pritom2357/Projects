// server.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

// Serve static files from 'public' directory
app.use(express.static('public'));

// Endpoint to fetch data from the API
app.get('/api/data', async (req, res) => {
    try {
        const apiResponse = await fetch('https://r.applovin.com/maxReport?api_key=U_6ufDXDPxfXT5mJr1TXCfBDawPb6mmr3W01UHfLA6tC5gS_R-aTMng9oG4vXLk7wDJL8H_UKPGL3QtereTazI&start=2024-11-01&end=2024-11-28&columns=day,application,impressions,network,package_name,country,attempts,responses,fill_rate,estimated_revenue,ecpm&sort_day=ASC&format=json');
        const data = await apiResponse.json();
        res.json(data); // Send the data to the client
    } catch (error) {
        console.error('Error fetching data from API:', error);
        res.status(500).json({ error: 'Error fetching data from API' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
