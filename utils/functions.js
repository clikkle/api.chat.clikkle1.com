import * as cheerio from 'cheerio';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import mongoose from "mongoose";
import s3Client from '../libs/s3Client.js';
import axios from 'axios';
import { DateTime } from 'luxon';
import { getCache, setCache } from '../libs/cacheStore.js';
import https from 'https';
import organization from '../schema/organization.js';

const ACCOUNTS_DB_URI = process.env.MONGODB_ACCOUNT_CONNECTION;

function filterObject(obj, values) {
    const k = {};
    values.forEach(key => {
        if (obj.hasOwnProperty(key)) k[key] = obj[key];
    });
    return k;
}

async function getUserProfile(token, role) {
    try {
        const url = `${process.env.AUTH_SERVER}/${role}/profile`;
        const res = await axios.get(url, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        } , {
            httpsAgent: new https.Agent({ 
                rejectUnauthorized: false 
            })
        });

        const { user } = res.data;

        return user;
    } catch (e) {
        console.log(e);
        return null;
    }
}

async function getOrganization(orgId){

    try {
        let orgKey = 'org-info-' + String(orgId)
        let data = getCache(orgKey);
        if (data) {
            return data
        } else {

            let result  = await organization.findById(orgId);

            if(result){
                return result;
            }else{
                throw new Error(
                    `org-info Not Found`
                );
            }
          
        }
    } catch (e) {
        console.log(e);
        throw new Error(
            `org-info Not Found`
        );
    }

}

async function getUserDetails(userId) {
    try {
        const url = `${process.env.AUTH_SERVER}/api/auth/get_user_profile`;
        const res = await axios.post(url, {
            id : userId
        },{
            httpsAgent: new https.Agent({ 
                rejectUnauthorized: false 
            })
        });
        if(res.data.success){
        const { user } = res.data;
        return user;
        }else {
            return null
        }

    } catch (e) {
        console.log(e);
        return null;
    }
}

async function getUserProfileById(userId) {
    ///not in use
    try {
        let userKey = 'user-info-' + String(userId)
        let data = getCache(userKey);
        if (data) {
            return data
        } else {
            throw new Error(
                `User Not Found`
            );
        }
    } catch (e) {
        console.log(e);
        throw new Error(
            `User Not Found`
        );
    }
}

function generateOTP(length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var otp = '';

    for (var i = 0; i < length; i++) {
        var randomIndex = Math.floor(Math.random() * chars.length);
        otp += chars[randomIndex];
    }

    return otp;
}

const signToken = user => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "3d",
});

const orgToken = org => jwt.sign({ id : org._id  , name :org.name  , email : org.email} , process.env.JWT_SECRET, {
    expiresIn: "7d",
});

const parseIp = req =>
    req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;

const acceptFiles = function (...fileNames) {
    const tempStoragePath = 'temp_uploads';
    const actualStoragePath = 'uploads';

    fileNames.forEach(fileName => {
        const source = path.join(tempStoragePath, fileName);
        const destination = path.join(actualStoragePath, fileName);
        fs.renameSync(source, destination);
    });
};

const rejectFiles = function (...fileNames) {
    const folderPath = 'temp_uploads';

    fileNames.forEach(fileName => {
        if (!fileName) return;

        const fullPath = path.join(folderPath, fileName);
        return fs.unlinkSync(fullPath);
    });
};

const deleteFilesFromAWS = async function (files) {
    const command = new DeleteObjectsCommand({
        Bucket: process.env.JOB_APPLICATION_BUCKET,
        Delete: {
            Objects: files.map(file => ({ Key: file })),
        },
    });

    await s3Client.send(command);
};

const isEmptyObject = obj => {
    const ans = Object.keys(obj).length === 0;
    return ans;
};

function formatTime(time) {
    let str = '';

    const meridian = time.hour >= 12 ? 'PM' : 'AM';
    const offset = time.hour > 12 ? 12 : 0;

    str += (time.hour - offset).toString().padStart(2, '0');

    str += ':' + time.minute.toString().padStart(2, '0');

    str += ' ' + meridian;

    return str;
}

const isWeekend = date => [7, 6].includes(date.weekday);

function workingDays(dates) {
    const workingDays = [];

    const sDate = DateTime.utc(dates[0].year, dates[0].month, dates[0].day);
    const eDate = DateTime.utc(dates[1]?.year, dates[1]?.month, dates[1]?.day);

    if (dates.length === 1 && !isWeekend(sDate)) return [sDate.toISO()];

    let currentDate = sDate;

    while (currentDate <= eDate) {
        if (!isWeekend(currentDate)) workingDays.push(currentDate.toISO());

        currentDate = currentDate.plus({ day: 1 });
    }

    return workingDays;
}

function replaceImageSrc(htmlString, files) {
    if (!files.length) return htmlString;

    const $ = cheerio.load(htmlString);

    $('body').wrapInner(`<div id='content'></div>`);

    $('img').each((i, el) => {
        const imgSrc = $(el).attr('src');

        if (imgSrc && imgSrc.startsWith('data:image/')) {
            const file = files.shift();
            if (file) {
                $(el).removeAttr('src');
                const URL = `${process.env.SERVER}/static/${file}`;
                $(el).attr('src', URL);
            }
        }
    });

    return $.html('#content');
}

function deleteImageFromHtml(htmlString, files) {
    files.forEach(name => {
        if (htmlString.includes(name)) {
            fs.unlinkSync(path.join('./uploads/' + name));
        }
    });
}

function updateImageHtml(htmlString, files) {
    files.forEach((name, i) => {
        if (!htmlString.includes(name)) {
            fs.unlinkSync(path.join('./uploads/' + name));
            files.splice(i, 1);
        }
    });
}

function generateTemplate(template, data) {
    if (!template) throw new Error('Template must be provided');

    const keys = Object.keys(data);
    keys.forEach(key => {
        const regex = new RegExp(`{{${[key]}}}`, 'gi');
        template = template.replace(regex, data[key]);
    });

    return template;
}

// Convert date string to Date object for comparison
const getCurrentDateString = () => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  };
  
  // Function to convert DD/MM/YYYY to Date object
  const convertToDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  
  const getUserDetailsByIds = async (assignedToIds) => {
    
    const db2Connection = mongoose.createConnection(ACCOUNTS_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const UserSchema = new mongoose.Schema({
      _id: mongoose.Schema.Types.ObjectId,
      firstName: String,
      lastName: String,
      username: String,
      email: String,
    });
    const User = db2Connection.model('User', UserSchema);
    const employees = await User.find({ _id: { $in: assignedToIds } }).select('email firstName lastName _id');
    return employees;
  };

export {
    filterObject,
    generateOTP,
    signToken,
    parseIp,
    acceptFiles,
    rejectFiles,
    deleteFilesFromAWS,
    isEmptyObject,
    getUserProfile,
    formatTime,
    isWeekend,
    workingDays,
    replaceImageSrc,
    deleteImageFromHtml,
    updateImageHtml,
    generateTemplate,
    getUserProfileById,
    getUserDetails,
    getOrganization,
    orgToken,
    getCurrentDateString,
    convertToDate,
    getUserDetailsByIds
};
