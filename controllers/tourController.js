const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');
const AppError = require('../utils/appError');

//// route handlers
exports.aliasTopCheap = function (req, res, next) {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingAverage,summery,difficulty';
  next();
};
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.getTourStats = catchAsync(async function (req, res, next) {
  const stats = await Tour.aggregate([
    { $match: { ratingAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
exports.getMonthlyStats = catchAsync(async function (req, res, next) {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        monthlyTourNumber: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $sort: { monthlyTourNumber: -1 },
    },
    {
      $project: { _id: 0 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
exports.getToursWithin = catchAsync(async function (req, res, next) {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  console.log(distance, latlng, unit, lat, lng);
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng'
      )
    );
  }
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
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
  const distances = await Tour.aggregate([
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

exports.updateTour = factory.updateOne(Tour);

exports.createTour = factory.createOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);
// {
//   $geoNear: {
//     near: {
//       type: "Point",
//       coordinates: [lng*1,lat*1]
//     },
//     distanceField: "distance",
//     distanceMultiplier:multiplier
//   },
//   {
//     $project: {
//       distance: 1,
//       name: 1
//     }
//   }
// }
