import express from 'express';
import create from '../../routes/hr/offerLetter/create.js';
import generate from '../../routes/hr/offerLetter/generate.js';
import fetch from '../../routes/hr/offerLetter/fetch.js';

const offerLetter = new express.Router();

// GET
offerLetter.get('/:id', fetch);
// offerLetter.get('/generate-info/:userId', generate);
offerLetter.get('/generate-info/:jobApplicationId', generate);

// POST
offerLetter.post('/', create);

export default offerLetter;
