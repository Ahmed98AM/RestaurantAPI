const mongoose = require('mongoose');
const Restaurant = require('./restaurantModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can't be empty !"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Review must belong to a restaurant'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must have an user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({ restaurant: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
reviewSchema.statics.calculateAvgRatings = async function (restaurantId) {
  const stats = await this.aggregate([
    {
      $match: { restaurant: restaurantId },
    },
    {
      $group: {
        _id: '$restaurant',
        nRatings: { $sum: 1 },
        avgRatings: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      ratingQuantity: stats[0].nRatings,
      ratingAverage: stats[0].avgRatings,
    });
  } else {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      ratingQuantity: 0,
      ratingAverage: 4.5,
    });
  }
};
reviewSchema.post('save', function () {
  this.constructor.calculateAvgRatings(this.restaurant);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calculateAvgRatings(this.r.restaurant);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
