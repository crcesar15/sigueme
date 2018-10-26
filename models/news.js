var mongoose = require('mongoose');

var geolocationSchema = mongoose.Schema({
  lng:{
    type: Number
  },
  lat:{
    type: Number
  }
});

var newSchema = mongoose.Schema({
  id_user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Users',
    required:true
  },
  // id_via:{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref:'Vias',
  //   required:true
  // },
  title:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  event_type:{
    type: Number,
    require: true,
    default: 0
  },
  created: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
  },
  status:{
    type: Number,
    require: true,
    default: 0
  },
  reports:{
    type: Number,
    default: 0
  },
  node: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('New',newSchema);
