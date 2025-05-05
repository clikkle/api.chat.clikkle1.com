import express from 'express';
import create from '../../routes/employee/projects/create.js';
import fetch from '../../routes/employee/projects/fetch.js';
import update from '../../routes/employee/projects/update.js';

const projectsRouter = express.Router();

projectsRouter.get('/', fetch);
projectsRouter.get('/:id', fetch);

projectsRouter.post('/', create);

projectsRouter.patch('/:projectId', update);

export default projectsRouter;
