const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const router = express.Router();

router.use('/:restaurantId/reviews', reviewRouter);

router
  .route('/top3cheap')
  .get(
    restaurantController.getTopCheap,
    restaurantController.getAllRestaurants
  );

router
  .route('/Restaurants-within/:distance/center/:latlng/unit/:unit')
  .get(restaurantController.getRestaurantsWithin);
router
  .route('/distances/center/:latlng/unit/:unit')
  .get(restaurantController.getDistances);

router
  .route('/')
  .get(restaurantController.getAllRestaurants)
  .post(
    authController.protect,
    authController.restricTo('admin'),
    restaurantController.createRestaurant
  );
router
  .route('/:id')
  .get(restaurantController.getRestaurant)
  .patch(
    authController.protect,
    authController.restricTo('admin'),
    restaurantController.updateRestaurant
  )
  .delete(
    authController.protect,
    authController.restricTo('admin'),
    restaurantController.deleteRestaurant
  );

module.exports = router;
