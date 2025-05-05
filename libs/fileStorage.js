import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function deleteFile(id, user) {
    try {
        const token = user.token;

        await axios.delete(`${process.env.FILES_API}/file/private/${id}`, {
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Encoding': 'multipart/form-data',
            },
        });
    } catch (e) {
        if (e.response) {
            if (e.response.status !== 404) Error.throw(e.response.data.errors[0], 400);
        } else {
            Error.throw(e);
        }
    }
}

async function uploadFile(file, user) {
    try {
        const token = user.token;
        const path = file.path;

        const formData = new FormData();
        const readableStream = fs.createReadStream(path);

        formData.append('files', readableStream);

        const response = await axios.post(`${process.env.FILES_API}/file/private/hr`, formData, {
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Encoding': 'multipart/form-data',
            },
        });

        fs.unlink(path, err => console.log(err));

        return response.data.uploaded.pop()._id;
    } catch (e) {
        if (e.response) {
            Error.throw(e.response.data.errors[0], 400);
        } else {
            Error.throw(e);
        }
    }
}

export { deleteFile, uploadFile };
