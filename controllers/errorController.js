const AppError = require('../utils/appError');

const castErrorDBHandler = function (err) {
  return new AppError(`could't find ${err.path}:${err.value}`, 400);
};
const duplicateFieldsDBHandler = function (err) {
  let dubField = err.keyValue.name;
  return new AppError(
    `Duplicate field value: ${dubField}. Please use another value!`,
    400
  );
};
const validationErrorDBHandler = function (err) {
  const validErrors = Object.values(err.errors).map((err) => err.message);
  return new AppError(`${validErrors.join('. ')}`, 400);
};
const JWTErrorhandler = function () {
  return new AppError(`Invalid token, please login again !`, 401);
};
const JWTExpiredHandler = function () {
  return new AppError(`Your token has expired, please login again !`, 401);
};

const sendErrorDev = function (res, err) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = function (res, err) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('Error: non operational error');
    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong!!',
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  const envType = process.env.NODE_ENV;

  if (envType === 'development') {
    sendErrorDev(res, err);
  } else {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = castErrorDBHandler(error);
    }
    if (error.code === 11000) {
      error = duplicateFieldsDBHandler(error);
    }
    if (err.name === 'ValidationError') {
      error = validationErrorDBHandler(error);
    }
    if (err.name === 'JsonWebTokenError') {
      error = JWTErrorhandler();
    }
    if (err.name === 'TokenExpiredError') {
      error = JWTExpiredHandler();
    }
    sendErrorProd(res, error);
  }
};
