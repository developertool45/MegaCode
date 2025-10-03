import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/index.js';
// import connectDB from './db/dbconfig.js';
dotenv.config({
  path: './.env',
});

const PORT = process.env.PORT;

await connectDB()
    .then(() => {
        app.listen(PORT, () => console.log(`server starting listening on ${PORT}`));
    })
    .catch((error) => {
        console.error('MongoDB connection error', error);
        process.exit(1);
    });
