import express from 'express';
import create from '../../routes/employee/expenses/create.js';
import upload from '../../libs/multer.js';
import list from '../../routes/employee/expenses/list.js';

const expensesRouter = express.Router();

expensesRouter.post(
    '/',
    upload.fields([{ name: 'invoice', maxCount: 1 }]),
    create
);

expensesRouter.get('/', list);

export default expensesRouter;
