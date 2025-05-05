import express from 'express';
import create from '../../routes/hr/question/create.js';
import update from '../../routes/hr/question/update.js';
import _delete from '../../routes/hr/question/delete.js';
import fetch from '../../routes/hr/question/fetch.js';

const questionRouter = express.Router();

questionRouter.get('/', fetch);
questionRouter.get('/:jobId', fetch);

questionRouter.post('/', create);
questionRouter.patch('/', update);
questionRouter.delete('/:jobId', _delete);

export default questionRouter;
