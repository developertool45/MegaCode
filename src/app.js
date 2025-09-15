import express from 'express';
const app = express();
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgon from 'morgan';

// import routes
import healthCheck from './routes/healthcheck.routes.js';
import auth from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import tasksRoutes from './routes/task.routes.js';
import notesRoutes from './routes/note.routes.js';
import subTasksRoutes from './routes/subTasks.routes.js';

const corsOrigin = process.env.CORS_ORIGIN || 'https://tasks-v1mb.onrender.com';
console.log(`CORS_ORIGIN configured as: ${corsOrigin}`); // Good for debugging!

const corsOptions = {
  origin: corsOrigin, // Use the variable directly
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
	"Origin",
    "Accept",
    "X-Requested-With",
    "Content-Type",
    "Authorization",
	"device-remember-token",
	"Access-Control-Allow-Origin", 
  ],
  credentials: true,
};

app.use(cors(corsOptions));


  
// middleware for form and json data
app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({ extended: true , limit: '10kb'}));
app.use(express.static('public'));
//cookie parser
app.use(cookieParser())

app.set('trust proxy', 1);

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // max 100 requests per IP
	message: "⚠️ Too many requests from this IP, please try again later.",
	standardHeaders: true,
	legacyHeaders: false,
});

//security middleware
app.use(hpp());
app.use(helmet());
// app.use(mongoSanitize());

//logger
if (process.env.NODE_ENV === 'development') {
	app.use(morgon('dev'));
}

app.use('/api', limiter);

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



