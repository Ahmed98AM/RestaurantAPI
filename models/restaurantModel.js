const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A restaurant must have a name'],
      unique: true,
      trim: true,
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'The rating should be 1.0 or hight'],
      max: [5, 'The rating should be 5.0 or lower'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    avgPrice: {
      type: Number,
      required: [true, 'A restaurant must have a price'],
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A restaurant must have an image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
restaurantSchema.index({ avgPrice: 1, ratingAverage: -1 });
restaurantSchema.index({ startLocation: '2dsphere' });

restaurantSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'restaurant',
  localField: '_id',
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;
