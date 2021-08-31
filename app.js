const express = require('express');
const app = express();
const morgan = require('morgan');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const restaurantRouter = require('./routes/restaurantRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour !',
});

// Set security HTTP headers
app.use(helmet());
// Limit requests from the same API
app.use('/api', limiter);
// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
// Data sanitization against noSQL query injection
app.use(mongoSanitize());
// Data sanitization against xss
app.use(xss());
const hpp = require('hpp');
// Preventing parameter polution
app.use(
  hpp({
    whitelist: ['ratingsQuantity', 'ratingsAverage', 'avgPrice'],
  })
);
// Serving static files
app.use(express.static(`${__dirname}/public`));

//// routes
app.use('/reviews', reviewRouter);
app.use('/restaurants', restaurantRouter);
app.use('/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`couldn't find ${req.originalUrl} on the server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
