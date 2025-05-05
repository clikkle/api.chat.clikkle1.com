import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

// const upload = multer({
//     storage: multer.diskStorage({
//         destination: './uploads',
//         filename: (req, file, cb) => {
//             const id = new mongoose.Types.ObjectId();
//             const uniqueSuffix = id.toString();
//             cb(null, uniqueSuffix + path.extname(file.originalname));
//         },
//     }),
// });
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadFolder = 'uploads';
      // Check if the folder exists, if not, create it
      if (!fs.existsSync(uploadFolder)) {
        fs.mkdirSync(uploadFolder);
      }
      cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
      //cb(null, `${Date.now()}-${file.originalname}`);
      const id = new mongoose.Types.ObjectId();
         const uniqueSuffix = id.toString();
           cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage });

export default upload;
