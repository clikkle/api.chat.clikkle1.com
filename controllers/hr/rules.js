import express from 'express';
import create from '../../routes/hr/rules/create.js';
import fetch from '../../routes/hr/rules/fetch.js';
import update from '../../routes/hr/rules/update.js';
import _delete from '../../routes/hr/rules/delete.js';
import fetchbyId from '../../routes/hr/rules/fetchbyId.js';

const rulesRouter = express.Router();

rulesRouter.get('/', fetch);
rulesRouter.get('/:ruleId', fetchbyId);

rulesRouter.post('/', create);

// Patch
rulesRouter.patch('/:ruleId', update);

// Delete
rulesRouter.delete('/:ruleId', _delete);

export default rulesRouter;
