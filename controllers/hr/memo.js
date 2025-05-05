import express from 'express';
import create from '../../routes/hr/memo/create.js';
import fetch from '../../routes/hr/memo/fetch.js';
import update from '../../routes/hr/memo/update.js';
import _delete from '../../routes/hr/memo/delete.js';
import fetchbyId from '../../routes/hr/memo/fetchbyId.js'

const memoRouter = express.Router();

memoRouter.get('/', fetch);
memoRouter.get('/:memoId', fetchbyId);

memoRouter.post('/', create);

// Patch
memoRouter.patch('/:memoId', update);

// Delete
memoRouter.delete('/:memoId', _delete);

export default memoRouter;
