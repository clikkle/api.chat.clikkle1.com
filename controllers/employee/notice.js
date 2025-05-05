import express from 'express';
import fetch from '../../routes/employee/notice/fetch.js';

const memoRouter = express.Router();

memoRouter.get('/', fetch);
memoRouter.get('/:id', fetch);

export default memoRouter;
