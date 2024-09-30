const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const port = 3000;

const uri =
  "mongodb+srv://mkneuffer:mkneuffer123@a3-mkneuffer.m9b34.mongodb.net/?retryWrites=true&w=majority&appName=a3-mkneuffer";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let scoresCollection;

client
  .connect()
  .then(() => {
    const db = client.db("a4-mkneuffer");
    scoresCollection = db.collection("data");
    console.log("Connected to MongoDB");
  })
  .catch((error) => console.error("MongoDB connection error:", error));

app.use(express.json());
app.use(express.static("public"));

app.post("/save-highscore", async (req, res) => {
  const { name, score } = req.body;
  try {
    const result = await scoresCollection.insertOne({ name, score });
    res.status(201).json({ success: true, message: "High score saved!" });
  } catch (error) {
    console.error("Error saving high score:", error);
    res
      .status(500)
      .json({ success: false, message: "Error saving high score" });
  }
});

app.get("/highscore", async (req, res) => {
  try {
    const highScore = await scoresCollection
      .find()
      .sort({ score: -1 })
      .limit(1)
      .toArray();
    if (highScore.length > 0) {
      res.json(highScore[0]);
    } else {
      res.json({ name: "No scores yet", score: 0 });
    }
  } catch (error) {
    console.error("Error fetching high score:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching high score" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
