//Practically finished!

const express = require('express');
const cors = require('cors');
const dir  = 'public/';
const path = require('path') //new line for submission
const port = 3000;

const app = express();

app.use(cors())
// app.use( express.static(dir)); //Allows "public" files to be accessed and utilized.
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res)=>{
         res.sendFile(path.join(__dirname, 'public', 'index.html'))
})
// app.get('/', (req, res)=>{
//     res.sendFile(__dirname + '/public/index.html')


// })

app.listen (process.env.PORT || 3000);
