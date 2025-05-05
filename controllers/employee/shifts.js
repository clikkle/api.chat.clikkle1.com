import express from 'express';
import clockIn from '../../routes/employee/shifts/clock-in.js';
import clockOut from '../../routes/employee/shifts/clock-out.js';
import data from '../../routes/employee/shifts/data.js';
import attendance from '../../routes/employee/shifts/attendance.js';

const clocksRouter = express.Router();

clocksRouter.get('/', data);
clocksRouter.get('/attendance', attendance);

clocksRouter.post('/clock-in', clockIn);
clocksRouter.post('/clock-out', clockOut);

export default clocksRouter;
