import express from 'express';
import fetch from '../../routes/hr/projects/fetch.js';
import create from '../../routes/hr/projects/create.js';
import dashboard from '../../routes/hr/projects/dashboard.js';
const projectsRouter = express.Router();

projectsRouter.get('/', fetch);
projectsRouter.get('/dashbaord', dashboard);

projectsRouter.get('/:id', fetch);
projectsRouter.post('/add' , create)

export default projectsRouter;
