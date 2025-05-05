import express from 'express';
import create from '../../routes/hr/lists/create.js';
import fetch from '../../routes/hr/lists/fetch.js';
import _delete from '../../routes/hr/lists/delete.js';

const listsRouter = express.Router();

listsRouter.get('/:name', fetch);
listsRouter.get('/by-id/:id', fetch);

listsRouter.post('/', create);

listsRouter.delete('/:id', _delete);

export default listsRouter;
