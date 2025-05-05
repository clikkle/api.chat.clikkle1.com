import express from 'express';
import list from '../../routes/hr/expenses/list.js';
import update from '../../routes/hr/expenses/update.js';

const expensesRouter = express.Router();

expensesRouter.get('/', list);

expensesRouter.patch('/:expenseId', update);

export default expensesRouter;
