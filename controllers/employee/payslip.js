import express from 'express';
import fetch from '../../routes/employee/payslip/fetch.js';

const payslipRouter = express.Router();

payslipRouter.get('/', fetch);

export default payslipRouter;
