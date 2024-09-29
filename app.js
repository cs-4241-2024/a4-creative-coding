import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Config, Score } from './models.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname)));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://a4-hanna-trinh.vercel.app' : 'http://localhost:5173',
}));

app.use(express.json());

app.post("/scores", async (req, res) => {
    try {
        const { name, score } = req.body;
        // Input validation
        if (!name || typeof name !== 'string' || !score || typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid input data' });
        }
        const newScore = new Score({ name, score });
        await newScore.save();
        res.json(newScore);
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

app.get("/scores", async (req, res) => {
    try {
        const scores = await Score.find().sort({ score: -1 }).limit(10);
        res.json(scores);
    } catch (error) {
        console.error('Error fetching scores:', error);
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});

app.post("/config", async (req, res) => {
    try {
        // Save the configuration to the database
        const { config } = req.body;
        console.log('Received config data:', config);
        await Config.findOneAndUpdate({}, config, { upsert: true, new: true });
        res.json({ message: 'Config saved: ', config });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ error: 'Failed to save config' });
    }
});

app.get("/config", async (req, res) => {
    try {
        const config = await Config.findOne();
        res.json(config);
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");

        // Start the server after the connection is established
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log("Server is running on port 3000");
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit on connection error
    }
};

start();
