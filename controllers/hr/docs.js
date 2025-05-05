import express from 'express';
import create from '../../routes/hr/docs/create.js';
import fetch from '../../routes/hr/docs/fetch.js';
import _delete from '../../routes/hr/docs/delete.js';
import update from '../../routes/hr/docs/update.js';

const docsRouter = express.Router();

docsRouter.get('/', fetch);
docsRouter.get('/:id', fetch);

docsRouter.post('/', create);

// Patch
docsRouter.patch('/:docId', update);

// Delete
docsRouter.delete('/:docId', _delete);

export default docsRouter;
