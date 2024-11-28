import fetch from 'node-fetch';
import mongoose from 'mongoose';

// Connect to MongoDB
mongoose.connect('mongodb+srv://pritombiswas9999:CwHLZPuVbsA9iz4v@test.9yr2e.mongodb.net/test?retryWrites=true&w=majority')

.then(() => {
    console.log("Connected to MongoDB!");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

// Define Mongoose Schema and Model
const DataSchema = new mongoose.Schema({
    day: { type: Date, required: true },
    application: { type: String, required: true },
    impressions: { type: Number, required: true },
    network: { type: String, required: true },
    package_name: { type: String, required: true },
    country: { type: String, required: true },
    attempts: { type: Number, required: true },
    responses: { type: Number, required: true },
    fill_rate: { type: Number, required: true },
    estimated_revenue: { type: Number, required: true },
    ecpm: { type: Number, required: true },
});

const Data = mongoose.model('Data', DataSchema);

// Fetch data and save to MongoDB
async function fetchData() {
    try {
        // Fetch data from AppLovin API
        const myPosts = await fetch('https://r.applovin.com/maxReport?api_key=U_6ufDXDPxfXT5mJr1TXCfBDawPb6mmr3W01UHfLA6tC5gS_R-aTMng9oG4vXLk7wDJL8H_UKPGL3QtereTazI&start=2024-11-01&end=2024-11-28&columns=day,application,impressions,network,package_name,country,attempts,responses,fill_rate,estimated_revenue,ecpm&sort_day=ASC&format=json');
        const response = await myPosts.json();
        // console.log(response);
        

        // Loop through the data and save each entry to MongoDB
        const data = response.results;

        // Loop through the "data" array and save each entry to MongoDB
        for (let i = 0; i < data.length; i++) {
            // console.log(data[i]); // Log each object for debugging

            const postName = new Data({
                day: new Date(data[i].day), // Ensure the date is in correct format
                application: data[i].application,
                impressions: data[i].impressions,
                network: data[i].network,
                package_name: data[i].package_name,
                country: data[i].country,
                attempts: data[i].attempts,
                responses: data[i].responses,
                fill_rate: data[i].fill_rate,
                estimated_revenue: data[i].estimated_revenue,
                ecpm: data[i].ecpm,
            });

            await postName.save(); // Save to MongoDB
            // console.log(`Saved document ${i + 1} to the database.`);
        }
        

        console.log("All data saved to MongoDB!");
    } catch (error) {
        console.error("Error during data fetching or saving:", error);
    }
}

fetchData();
