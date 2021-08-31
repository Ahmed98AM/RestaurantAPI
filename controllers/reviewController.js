const Review = require('../models/reviewModel');
const factory = require('./handlerFunctionsFactory');

exports.setRestaurantUserId = function (req, res, next) {
  if (!req.body.restaurant) req.body.restaurant = req.params.restaurantId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReveiw = factory.deleteOne(Review);
