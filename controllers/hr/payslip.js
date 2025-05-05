import express from 'express';
import create from '../../routes/hr/payslip/create.js';
import update from '../../routes/hr/payslip/update.js';
import fetch from '../../routes/hr/payslip/fetch.js';
import _delete from '../../routes/hr/payslip/delete.js';

const payslipRouter = express.Router();

payslipRouter.get('/', fetch);
payslipRouter.get('/:employeeId', fetch);
payslipRouter.post('/', create);
payslipRouter.patch('/:id', update);
payslipRouter.delete('/:id', _delete);

export default payslipRouter;
