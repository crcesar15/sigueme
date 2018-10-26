var mongoose = require('mongoose');

var geolocationSchema = mongoose.Schema({
  lng:{
    type: Number
  },
  lat:{
    type: Number
  }
});

var userSchema = mongoose.Schema({
  firstName:{
    type: String,
    required: true
  },
  lastName:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  status:{
    type: Number,
    require: true,
    default: 0
  },
  profileImage:{
    type: String,
    default: ''
  },
  password:{
    type: String,
    required: true
  },
  home: geolocationSchema,
  work:geolocationSchema,
});

module.exports = mongoose.model('User',userSchema);
