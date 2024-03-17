const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default : []
  },
  verified: {
    type: Boolean,
    default: false
  },
  profilePicture :{
    type : String,
    default : "https://imgs.search.brave.com/zgudheWMmcsW_dmo0Otur7tn4aBG6VVffFsMD4fEq4I/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1LzAwLzU0LzI4/LzM2MF9GXzUwMDU0/Mjg5OF9McFlTeTRS/R0FpOTVhRGltM1RM/dFNnQ05VeE5sT2xj/TS5qcGc"
},
},{timestamps : true});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
