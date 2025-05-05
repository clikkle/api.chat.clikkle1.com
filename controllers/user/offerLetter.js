import express from 'express';
import fetch from '../../routes/user/offerLetter/fetch.js';
import sign from '../../routes/user/offerLetter/sign.js';

const offerLetter = new express.Router();

// GET
offerLetter.get('/', fetch);
offerLetter.patch('/sign', sign);

export default offerLetter;
