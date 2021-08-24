const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
dotenv.config({ path: './config.env' });
const tour = require('../../models/tourModel');
const user = require('../../models/userModel');
const review = require('../../models/reviewModel');
// connecting the DB

const databaseLink = process.env.DATABASE_LINK.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(databaseLink, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection Successful');
  });
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const deleteData = async function () {
  try {
    await tour.deleteMany();
    await user.deleteMany();
    await review.deleteMany();
    console.log('Data deleted!');
  } catch (err) {
    console.log(error);
  }
  process.exit();
};
const importData = async function () {
  try {
    await tour.create(tours);
    await user.create(users, { validateBeforeSave: false });
    await review.create(reviews);
    console.log('Data imported!');
  } catch (err) {
    console.log(error);
  }
  process.exit();
};
if (process.argv[2] === '--delete') {
  deleteData();
}
if (process.argv[2] === '--import') {
  importData();
}
