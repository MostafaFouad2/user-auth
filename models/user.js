const mongoose = require('mongoose');
const User = mongoose.model(
  "User",
  new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  phoneNumber: {
    type: String,
    unique: [true, 'this phone exist'],
    required: true,
    minLength:[10, 'phNr min 8']
  },
  profileImag: {
    type: String
  },
  password: {
    type: String,
    required: true,
    minLength:[6, 'pass min 6 ch']
  },
  isAdmin:{
    type:Boolean,
    default:false,
  },
  isActive:{
    type:Boolean,
    default:false,
  },
  isBlocked:{
    type:Boolean,
    default:false,
  },
  verCode: { type: String },
  token: { type: String },
}
));

module.exports = User;

