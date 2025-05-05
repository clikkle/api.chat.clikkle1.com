import express from 'express';
import apply from '../../routes/employee/leaves/apply.js';
import data from '../../routes/employee/leaves/data.js';
import list from '../../routes/employee/leaves/list.js';
import listAll from '../../routes/common/leaveType/listAll.js';

const leavesRouter = express.Router();

leavesRouter.get('/metrics', data);
leavesRouter.get('/types', listAll);
leavesRouter.get('/:id', list);

leavesRouter.post('/', apply);

export default leavesRouter;
