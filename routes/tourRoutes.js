const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

//// middleware
const router = express.Router();
router.use('/:tourId/reviews', reviewRouter);
//// routes
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopCheap, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-stats/:year')
  .get(
    authController.protect,
    authController.restricTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyStats
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router
  .route('/distances/center/:latlng/unit/:unit')
  .get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restricTo('admin', 'lead-guide', 'guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restricTo('admin', 'lead-guide', 'guide'),
    tourController.deleteTour
  );

module.exports = router;
