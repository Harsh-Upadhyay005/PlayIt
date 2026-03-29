
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/index.js';


const app = express();
dotenv.config({
    path: './.env'
});



connectDB().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to connect to the database:', error.message);
    process.exit(1); 
});


