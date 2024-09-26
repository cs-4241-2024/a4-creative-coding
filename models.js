import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const ScoreSchema = new Schema({
    name: String,
    score: Number,
    date: { type: Date, default: Date.now }
});

const ConfigSchema = new mongoose.Schema({
    cubeColor: Number,
    cubeSize: Number,
    cubeSpeed: Number,
    backgroundColor: Number
});

const Score = model('Score', ScoreSchema);
const Config = model('Config', ConfigSchema);
export { Score, Config };