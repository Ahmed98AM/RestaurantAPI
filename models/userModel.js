const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name !'],
  },
  email: {
    type: String,
    require: [true, 'please provide your email !'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please enter a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'please provide a password !'],
    minlength: 8,
    select: false,
  },
  passwordChangedAt: Date,
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password !'],
    validate: {
      validator: function (confirmPass) {
        return this.password === confirmPass;
      },
      message: "the password doesn't match !",
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  passwordResetExpires: Date,
  passwordResetToken: String,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordConfirm = undefined;
//   next();
// });
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password') || this.isNew) return next();
//   this.passwordChangedAt = Date.now() - 1000;
// });
userSchema.pre('/^find/', async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    return parseInt(this.passwordChangedAt.getTime() / 1000, 10) > JWTTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
