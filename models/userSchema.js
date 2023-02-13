const mongoose = require('mongoose');
const crypto = require('crypto');

const contactSchema = mongoose.Schema({
  username: String,
  lastSentMessage: String,
  lastSeen: Date,
  unRead: Number,
});

const userSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    required: [true, "Username cannot be empty"],
    unique: true
  },
  isOnline: Boolean,
  lastSeen: Date,
  email: {
    type: String
  },
  photo: {
    type: String,
    default: 'avatar.png'
  },
  messages: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Messages'
  },
  contacts: [contactSchema],
  createdOn: {
    type: Date,
    default: Date.now()
  },
  hash: String,
  salt: String
});


userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  if(this.salt && this.hash) {
    return true;
  }
  return false;
}
userSchema.methods.verifyPassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return this.hash === hash;
}

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
