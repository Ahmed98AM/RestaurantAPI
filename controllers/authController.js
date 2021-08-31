const User = require('./../models/userModel');
const { promisify } = require('util');
const JWT = require('jsonwebtoken');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const createSendToken = function (user, statusCode, res) {
  const id = user._id;
  const token = JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_DURATION,
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
  return token;
};

exports.signUp = catchAsync(async function (req, res, next) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('email or password is missing !'), 400);
  }

  const foundUser = await User.findOne({ email }).select('+password');
  if (
    !foundUser ||
    !(await foundUser.correctPassword(password, foundUser.password))
  ) {
    return next(new AppError('incorrect email or password !'), 401);
  }
  foundUser.active = true;
  await foundUser.save({ validateBeforeSave: false });
  createSendToken(foundUser, 200, res);
});

exports.protect = catchAsync(async function (req, res, next) {
  let token;
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    return next(
      new AppError('you are not logged in.. please login to get access !'),
      401
    );
  }
  token = req.headers.authorization.split(' ')[1];
  let decodedData = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decodedData.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user associated with this token does no longer exist !'
      ),
      401
    );
  }

  if (currentUser.changedPasswordAfter(decodedData.iat)) {
    return next(
      new AppError(
        'The user associated with this token changed his password !'
      ),
      401
    );
  }

  req.user = currentUser;

  next();
});

exports.restricTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action !', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async function (req, res, next) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('There is no user with this email address !', 404)
    );
  }

  //// Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //// Send it to user email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH with your new password and passwordConfirm to:\
  ${resetUrl}.\nIf you did't forgot your password, please ignore this email !`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for only 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email please try again later !',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async function (req, res, next) {
  //// Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('The token is invalid, or has expired !', 500));
  }

  //// If the token hasn't expired, and there is a user, update the password.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //// Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async function (req, res, next) {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is invalid !', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});
