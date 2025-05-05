import express from 'express';
import fetch from '../../routes/hr/jobApplication/fetch.js';
import _delete from '../../routes/hr/jobApplication/delete.js';
import metrics from '../../routes/hr/jobApplication/metrics.js';
import update from '../../routes/hr/jobApplication/update.js';
import reset from '../../routes/hr/jobApplication/reset.js';

const jobApplicationRouter = new express.Router();

// GET
jobApplicationRouter.get('/', fetch);
jobApplicationRouter.get('/metrics', metrics);
jobApplicationRouter.get('/:id', fetch);

jobApplicationRouter.patch('/status/:id', update('add'));
jobApplicationRouter.patch('/reset/:id', reset);

jobApplicationRouter.delete('/status/:id', update('remove'));
jobApplicationRouter.delete('/:id', _delete);

export default jobApplicationRouter;
