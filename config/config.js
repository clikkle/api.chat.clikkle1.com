import './env.js';
import './prototypes.js';
import { connectDB } from './database.js';
// import './watchers/uploads.js';

if (process.env.NODE_ENV !== 'test') {
    await connectDB('hr_clikkle');
}
