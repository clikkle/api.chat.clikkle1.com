import * as cheerio from 'cheerio';
import fs from 'fs';
import mime from 'mime-types';
import path from 'path';
import crypto from 'crypto';

class FileHandler {
    location = './uploads';

    constructor() {
        if (!fs.existsSync(this.location)) fs.mkdirSync(this.location);
    }

    getPath(filename) {
        return path.join(this.location, filename);
    }
    acceptFiles(files) {
        files.forEach(file => {
            const filePath = path.join(this.location, file);
            if (fs.existsSync(filePath))
           
            try {
                fs.writeFileSync(filePath, file);
                console.log(`File uploaded: ${filePath}`);
            } catch (e) {
                console.log(e);
                Error.throw(`Unable to upload the file at ${filePath}`, 500);
            }
        });
    }
    download(file, res) {
        const filePath = path.join(this.location, file);

        if (!fs.existsSync(filePath))
            return console.log(
                filePath + `Unable to find the file you're requesting. { FileHandler }`
            );

        try {
            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
        } catch (e) {
            console.log(e);
            Error.throw(`Something went wrong when downloading the file`, 500);
        }
    }

    deleteFiles(...files) {
        files.forEach(file => {
            const filePath = path.join(this.location, file);
            if (!fs.existsSync(filePath))
                return console.log(filePath + ' no such file found { FileHandler }');

            try {
                fs.unlinkSync(filePath, file.buffer);
            } catch (e) {
                console.log(e);
                Error.throw(`Unable to delete the file at ${filePath}`, 500);
            }
        });
    }

    decodeBase64(base64String) {
        if (!base64String) throw new Error('base64 string not provided');

        const [mimeInfo, base64Data] = base64String.split(';base64,');
        const mimeType = mimeInfo.replace('data:', '');
        const code = crypto.randomBytes(6).toString('hex');

        const filename = `file_${code}.${mime.extension(mimeType)}`;
        const filePath = path.join(this.location, filename);

        fs.writeFileSync(filePath, base64Data, 'base64');
       
        return filename;
    }

    decodeBase64Html(htmlString) {
        // Load HTML string into Cheerio
        const $ = cheerio.load(htmlString);

        const files = [];
        // Find all img tags and process their base64-encoded src attribute
        $('img').each((_, element) => {
            const imgSrc = $(element).attr('src');

            if (imgSrc && imgSrc.startsWith('data:image/')) {
                const filename = this.decodeBase64(imgSrc);
                files.push(filename);
            }
        });
        return files;
    }
}

export default FileHandler;
