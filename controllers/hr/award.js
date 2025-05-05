import express from 'express';
import create from '../../routes/hr/award/create.js';
import fetch from '../../routes/hr/award/fetch.js';
import update from '../../routes/hr/award/update.js';

const awardRouter = new express.Router();

// GET
awardRouter.get('/', fetch);
awardRouter.get('/:id', fetch);

// POST
awardRouter.post('/', create);

// PATCH
awardRouter.patch('/:id', update);

export default awardRouter;
