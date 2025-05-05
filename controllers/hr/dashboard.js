import express from 'express';
import overview from '../../routes/hr/dashboard/overview.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/', overview);

export default dashboardRouter;
