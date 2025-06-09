import express from 'express';
const app = express();
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import cors from 'cors';

//cookie parser
app.use(cookieParser())

// import routes
import healthCheck from './routes/healthcheck.routes.js';
import auth from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import tasksRoutes from './routes/task.routes.js';
import notesRoutes from './routes/note.routes.js';
import subTasksRoutes from './routes/subTasks.routes.js';


// middleware for form and json data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(cors({
	origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,	
}))

// all routes
app.use('/api/v1/healthcheck', healthCheck);
app.use('/api/v1/users', auth);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/subtasks', subTasksRoutes);
app.use('/api/v1/notes', notesRoutes);



//global error handler
app.use(errorHandler)

export default app;



