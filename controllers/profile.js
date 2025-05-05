import express from 'express';
import fetch from '../routes/profile/fetch.js';

const profileRouter = new express.Router();

// GET
profileRouter.get('/', fetch);

export default profileRouter;
