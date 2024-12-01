import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();


const apiKey = process.env.VITE_API_KEY;

if(!apiKey){
    console.error("API key not found in environment variables.");
    process.exit(1);    
}

const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.get('/api/data', async (req, res) => {
    try {
        const apiResponse = await fetch(`https://r.applovin.com/maxReport?api_key=${apiKey}&start=2024-11-10&end=2024-12-04&columns=day,application,impressions,network,package_name,country,attempts,responses,fill_rate,estimated_revenue,ecpm&sort_day=DESC&format=json`);
        const data = await apiResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from API:', error);
        res.status(500).json({ error: 'Error fetching data from API' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
