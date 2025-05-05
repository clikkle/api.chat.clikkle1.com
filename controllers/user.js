import express from 'express';
import jobApplicationRouter from './user/jobApplicationRouter.js';
import offerLetter from './user/offerLetter.js';
import answerRouter from './user/answer.js';
import agreementRouter from './user/agreement.js';
import onBoardingRouter from './user/step.js';
import subscriptionRouter from './hr/subscriptions.js';
import organizationRouter from './hr/organization.js';

const router = new express.Router();

router.use('/job-application', jobApplicationRouter);
router.use('/offer-letter', offerLetter);
router.use('/answer', answerRouter);
router.use('/agreement', agreementRouter);
router.use('/on-boarding', onBoardingRouter);
router.use('/subscription',subscriptionRouter);
export default router;
