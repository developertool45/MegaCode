import express from 'express';
const app = express();
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.middleware.js';

//cookie parser
app.use(cookieParser())

// import routes
import healthCheck from './routes/healthcheck.routes.js';
import auth from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';


// middleware for form and json data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// all routes
app.use('/api/v1/healthcheck', healthCheck);
app.use('/api/v1/users', auth);
app.use('/api/v1/projects',projectRoutes);



//global error handler
app.use(errorHandler)

export default app;



