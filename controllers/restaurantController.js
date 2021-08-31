const Restaurant = require('../models/restaurantModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFunctionsFactory');
const AppError = require('../utils/appError');

//// route handlers
exports.getTopCheap = function (req, res, next) {
  //removed
  req.query.limit = 3;
  req.query.sort = '-ratingsAverage,avgPrice';
  req.query.fields = 'name,avgPrice,ratingAverage,summery';
  next();
};
exports.getAllRestaurants = factory.getAll(Restaurant);
exports.getRestaurant = factory.getOne(Restaurant, { path: 'reviews' });

exports.getRestaurantsWithin = catchAsync(async function (req, res, next) {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng'
      )
    );
  }
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const restaurants = await Restaurant.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    data: {
      restaurants: restaurants,
    },
  });
});
exports.getDistances = catchAsync(async function (req, res, next) {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng'
      )
    );
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Restaurant.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      distances: distances,
    },
  });
});

exports.updateRestaurant = factory.updateOne(Restaurant);

exports.createRestaurant = factory.createOne(Restaurant);

exports.deleteRestaurant = factory.deleteOne(Restaurant);
