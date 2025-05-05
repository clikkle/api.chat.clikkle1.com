import './config/config.js';
import express from 'express';
import morgan from 'morgan';
import {successHandler as morganSuccessHandler, errorHandler as morganErrorHandler} from './config/morgan.js';
import errorHandler from './middlewares/errorHandler.js';
import authenticate from './middlewares/authenticate.js';
import s3Download from './middlewares/s3Download.js';
import cors from 'cors';

// Controllers
import employeeController from './controllers/employee.js';
import hrController from './controllers/hr.js';
import userController from './controllers/user.js';
import openController from './controllers/open.js';
import authenticateRole from './middlewares/authenticateRole.js';
import profileController from './controllers/profile.js';
import Download from './middlewares/Download.js';
import { setupProductsAndPlans } from './controllers/hr/plan.js';
// import authenticateRole from './middlewares/authenticateRole.js';


const app = new express();

app.use(express.json({ limit: '5mb' }));
app.use(cors());

app.use(morgan('dev'));
app.use('/download', Download);
app.disable('etag');
app.use('/static', express.static('uploads'));
app.use('/.well-known', express.static('./.well-known'));

app.use('/open', openController);

// app.use(authenticate);
app.use('/profile', authenticate,profileController);
app.use('/user',authenticate, userController);

app.use('/employee',authenticate, employeeController);
app.use('/hr', authenticate,authenticateRole('hr'), hrController);


// app.use('/triggerchatnotification', TriggerChatNotification);

// app.use('/employee', authenticateRole('employee'), employeeController);
// app.use('/hr', , hrController);

app.use(errorHandler);
app.use(morganSuccessHandler);
app.use(morganErrorHandler);

// setupProductsAndPlans();
export default app;
