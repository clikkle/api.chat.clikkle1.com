import express from 'express';
import shiftsRouter from './employee/shifts.js';
import profileRouter from './employee/profile.js';
import leavesRouter from './employee/leaves.js';
import expensesRouter from './employee/expenses.js';
import noticeRouter from './employee/notice.js';
import projectsRouter from './employee/projects.js';
import dashboardRouter from './employee/dashboard.js';
import payslipRouter from './employee/payslip.js';
import messageRouter from './employee/message.js';
import ruleRouter from './employee/rule.js';
import memoRouter from './employee/memo.js';

const router = new express.Router();

router.use('/dashboard', dashboardRouter);
router.use('/shift', shiftsRouter);
router.use('/profile', profileRouter);
router.use('/leaves', leavesRouter);
router.use('/expenses', expensesRouter);
router.use('/notice', noticeRouter);
router.use('/rule', ruleRouter);
router.use('/memo', memoRouter);
router.use('/projects', projectsRouter);
router.use('/payslip', payslipRouter);
router.use('/message',messageRouter)

export default router;
