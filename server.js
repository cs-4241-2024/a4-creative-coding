//require("dotenv").config()
const express = require("express")
const path = require('path')

const app = express()
app.use(express.urlencoded({ extended: true }))

app.use(express.static("public"))
app.use(express.json())

app.listen(3000)

//run()