const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
// process.on('uncaughtException', (err) => {
//   console.log(err.name, err.message);
//   process.exit(1);
// });
const app = require('./app');

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

//// start server

const server = app.listen(process.env.PORT, () => {
  console.log('server is running ...');
});

//// handling unhandled rejections

// process.on('unhandledRejection', (err) => {
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
