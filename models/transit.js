var mongoose = require('mongoose');

var traf = mongoose.Schema({
  traffic:{
    type: [Number],
    required: true
  }
});

var transitSchema = mongoose.Schema({
  id_via:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Vias',
    required:true
  },
  traffic:[traf]
});

module.exports = mongoose.model('Transit',transitSchema);
