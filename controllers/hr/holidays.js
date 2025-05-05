import express from 'express';
import create from '../../routes/hr/holiday/create.js';
import fetch from '../../routes/hr/holiday/fetch.js';
import _delete from '../../routes/hr/holiday/delete.js';
import update from '../../routes/hr/holiday/update.js';
import getAll from '../../routes/hr/holiday/getAll.js';

const holidaysRouter = express.Router();

holidaysRouter.get('/', fetch);
holidaysRouter.get('/getAll', getAll);

holidaysRouter.get('/:id', fetch);

holidaysRouter.post('/', create);

holidaysRouter.patch('/:id', update);

holidaysRouter.delete('/:id', _delete);

export default holidaysRouter;
