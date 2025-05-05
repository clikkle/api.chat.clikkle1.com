import express from 'express';
import fetch from '../../routes/user/agreement/fetch.js';
import employmentSign from '../../routes/user/agreement/employmentSign.js';
import nonDisclosureSign from '../../routes/user/agreement/nonDisclosureSign.js';
import intellectualSign from '../../routes/user/agreement/intellectualSign.js';
import sign from '../../routes/user/agreement/sign.js';

const agreementRouter = new express.Router();

agreementRouter.get('/', fetch);
agreementRouter.patch('/sign', sign);

export default agreementRouter;
