import FileHandler from '../classes/FileHandler.js';
import path from 'path';
import fs from 'fs';

export default async function (req, res, next) {
    try {
        const filename = req.url.slice(1);
       
        const file = new FileHandler();
        file.download(filename, res);
    } catch (err) {
        next(err);
    }
}
