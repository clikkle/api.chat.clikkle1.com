import express from 'express';
import overview from '../../routes/employee/dashboard/overview.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/', overview);

export default dashboardRouter;
