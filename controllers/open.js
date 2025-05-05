import express from 'express';
import login from '../routes/open/login.js';
import fetch from '../routes/open/jobListing/fetch.js';
import getUsersInfo from '../routes/open/getUsersInfo.js';
import createAccount from '../routes/open/createAccount.js';
import verifyResetToken from '../routes/open/verifyResetToken.js';
import getUserInfo from '../routes/open/getUserInfo.js';
import createSession from '../routes/open/createSession.js';
import generateResetToken from '../routes/open/generate-reset-token.js';
import createPassword from '../routes/open/createPassword.js';
import exists from '../routes/open/exists.js';
import validEmail from '../routes/open/validEmail.js';
import getOrg from '../routes/open/jobListing/getOrg.js'
import jobdata from '../routes/open/jobListing/jobdata.js';
const router = new express.Router();

// GET
router.get('/job-listing', jobdata);

router.get('/job-listing/:id', fetch);
router.get('/reset-code/:email', generateResetToken);
router.get('/user-info', getUserInfo);
router.post('/session', createSession);
router.get('/org-info', getOrg);


// POST
router.post('/create', createAccount);
router.post('/login', login);
router.post('/valid-email', validEmail);
router.post('/users-info', getUsersInfo);
router.post('/exists/email', exists('email'));
router.post('/verify/reset-code', verifyResetToken);

// PATCH
router.patch('/create-password', createPassword);

export default router;
