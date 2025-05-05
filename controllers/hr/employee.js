import express from 'express';
import create from '../../routes/hr/employee/create.js';
import fetch from '../../routes/hr/employee/fetch.js';
import terminate from '../../routes/hr/employee/terminate.js';
import removerecords from '../../routes/hr/employee/remove.js';
import metrics from '../../routes/hr/employee/metrics.js';
import getAll from '../../routes/hr/employee/getAll.js';
import createByadmin from '../../routes/hr/employee/createByadmin.js';
const employeeRouter = express.Router();

employeeRouter.get('/', fetch);
employeeRouter.get('/getAll', getAll);

employeeRouter.get('/metrics', metrics);
employeeRouter.get('/:employeeId', fetch);

employeeRouter.post('/', create);
employeeRouter.post('/byadmin', createByadmin);


employeeRouter.patch('/terminate/:employeeId', terminate);
employeeRouter.delete('/remove-records/:employeeId', removerecords);

export default employeeRouter;
