const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require("body-parser");
const pollRoutes = require("./routes/pollRoutes");

const app = express();

app.use(cors({
    origin: 'https://pollapplication.netlify.app',
    //origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use(cookieParser());


app.use('/api/polls', pollRoutes);

module.exports = app;