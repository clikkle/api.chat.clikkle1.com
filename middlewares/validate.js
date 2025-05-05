import Joi from 'joi';
import { status as httpStatus } from 'http-status';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(Error.throw(errorMessage, httpStatus.BAD_REQUEST));
  }
  Object.assign(req, value);
  return next();
};

export default validate;