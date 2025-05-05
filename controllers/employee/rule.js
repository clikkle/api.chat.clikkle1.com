import express from 'express';
import fetch from '../../routes/employee/rules/fetch.js';

const ruleRouter = express.Router();

ruleRouter.get('/', fetch);
ruleRouter.get('/:id', fetch);

export default ruleRouter;