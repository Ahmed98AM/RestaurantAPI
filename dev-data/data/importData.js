const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
dotenv.config({ path: './config.env' });
const restaurnat = require('../../models/restaurantModel');
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
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection Successful');
  });
const restaurnats = JSON.parse(
  fs.readFileSync(`${__dirname}/restaurants.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const deleteData = async function () {
  try {
    await restaurnat.deleteMany();
    await user.deleteMany();
    await review.deleteMany();
    console.log('Data deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const importData = async function () {
  try {
    await restaurnat.create(restaurnats);
    await user.create(users, { validateBeforeSave: false });
    // await review.create(reviews);
    console.log('Data imported!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--delete') {
  deleteData();
}
if (process.argv[2] === '--import') {
  importData();
}
