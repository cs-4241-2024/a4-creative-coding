const express = require("express"),
app = express()

app.use(express.static("public") )
app.use(express.json() )

async function run() {
  //app.post("/submit", async (req, res) => {})
}

run()

app.listen(3000)
