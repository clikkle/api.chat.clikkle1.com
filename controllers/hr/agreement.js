import express from 'express';
import generate from '../../routes/hr/agreement/generate.js';
import create from '../../routes/hr/agreement/create.js';
import fetch from '../../routes/hr/agreement/fetch.js';

const agreementRouter = new express.Router();

// GET
agreementRouter.get('/:id', fetch);

// POST
agreementRouter.patch('/:id', create);
agreementRouter.get('/generate-info/:userId', generate);

export default agreementRouter;
