var mongoose = require('mongoose');

var geolocationSchema = mongoose.Schema({
  lng:{
    type: Number,
    required: true
  },
  lat:{
    type: Number,
    required:true
  }
});
var viaSchema = mongoose.Schema({
  route:{
    type: String,
    required: true
  },
  origin: geolocationSchema,
  destination: geolocationSchema,
  middle: geolocationSchema,
  distance:{
    type: Number,
    required: true
  },
  duration:{
    type: Number,
    required: true
  },
  realDuration:{
    type: Number
  },
  nodo:{
    type:Number,
    required: true,
    default:1
  },
  neighbors:{
    type: [Number]
  },
  status:{
    type: Number,
    require: true,
    default: 1
  }
});

module.exports = mongoose.model('Via',viaSchema);
