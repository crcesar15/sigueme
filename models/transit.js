var mongoose = require('mongoose');

var transitSchema = mongoose.Schema({
  id_via:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Vias',
    required:true
  },
  durationStd:{
    type: Number,
    required: true
  },
  durationReal:{
    type: Number,
    required: true
  },
  concurrence:{
    type: Number,
    require: true,
    default: 0
  }
});

module.exports = mongoose.model('New',transitSchema);
