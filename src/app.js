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

const whitelist = [
	'https://tasks-frontend-dwjf.vercel.app', 	                 
	'http://localhost:5173',
];
  
const corsOptions = {
	origin(origin, callback) {
	  if (!origin || whitelist.includes(origin)) {
		callback(null, true);
	  } else {
		callback(new Error('Not allowed by CORS'));
	  }
	},
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use((req, res, next) => {
	console.log('🔥 Origin:', req.headers.origin);
	next();
});
  
// app.use(cors({
// 	// origin: [process.env.CORS_ORIGIN || "http://localhost:5173"],
// 	origin(origin, cb) {
// 		if (!origin || whitelist.includes(origin)) return cb(null, true);
// 		return cb(new Error('Not allowed by CORS'));
// 	  },
// 	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// 	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
// 	credentials: true
// }));


  
// middleware for form and json data
app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({ extended: true , limit: '10kb'}));
app.use(express.static('public'));
//cookie parser
app.use(cookieParser())


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



