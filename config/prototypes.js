import express from 'express';

express.response.success = function (res) {
    if (typeof res === 'string')
        return this.json({
            success: true,
            message: res,
        });

    return this.json({
        success: true,
        ...res,
    });
};

express.response.error = function (res) {
    if (typeof res === 'string' || Array.isArray(res))
        return this.json({
            errors: Array.isArray(res) ? res : [res],
            success: false,
        });

    return this.json({
        ...res,
        success: false,
    });
};

Error.throw = function (msg, code = 400) {
    throw Error.create(msg, code);
};

Error.create = function (msg, code = 400) {
    const error = new Error(msg);
    error.code = code;
    error.name = 'CustomError';
    return error;
};

Date.prototype.timezone = function (timeZone) {
    return new Date(this.toLocaleString('en-US', { timeZone }));
};

Date.prototype.isBetween = function (startDate, endDate) {
    return this.getTime() >= startDate.getTime() && this.getTime() <= endDate.getTime();
};
