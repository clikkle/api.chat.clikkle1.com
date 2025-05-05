import express from 'express';
import create from '../../routes/hr/department/create.js';
import update from '../../routes/hr/department/update.js';
import fetch from '../../routes/hr/department/fetch.js';
import _delete from '../../routes/hr/department/delete.js';
import getAll from '../../routes/hr/department/gatAll.js'
const departmentRouter = express.Router();

departmentRouter.get('/', fetch);
departmentRouter.get('/getAll', getAll);

departmentRouter.get('/:id', fetch);

departmentRouter.post('/', create);

departmentRouter.patch('/:id', update);

departmentRouter.delete('/:id', _delete);

export default departmentRouter;
