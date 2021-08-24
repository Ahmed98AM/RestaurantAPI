const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');

const filterObj = function (obj, ...wantedFields) {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (wantedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = factory.createOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getMe = function (req, res, next) {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async function (req, res, next) {
  //// Create error if user POSTed password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "You can't modify password here, please use /updateMyPassword",
        401
      )
    );
  }
  //// Filter out unwanted fields
  const filteredBody = filterObj(req.body, 'name', 'email');
  //// Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
