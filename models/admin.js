const mongoose = require('mongoose');

const { Schema } = mongoose;

const AdminSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
});

const Admin = mongoose.model('admin', AdminSchema);
module.exports = Admin;
