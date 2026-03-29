
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/index.js';


const app = express();
dotenv.config({
    path: './.env'
});

connectDB();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


