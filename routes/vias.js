var express = require('express');
var router = express.Router();
var Via = require('../models/vias');

//login del Sistema
router.get('/', function(req, res, next) {
  res.render('maps');
});

router.get('/routes', function(req, res, next) {
  Via.find()
  .select('_id route nodo distance duration origin destination')
  .sort({nodo: 'asc'})
  .exec(function(err, vias) {
          rutas = vias;
          res.render('routes',{rutas: rutas});
  });
});

router.get('/update_routes', function(req, res, next) {
  Via.find()
  .select('nodo route duration traffic')
  .sort({nodo: 'asc'})
  .exec(function(err, vias) {
          res.status(200).send(vias)
  });
});

router.post('/', function(req, res, next) {
  var via = new Via();
  via.route = req.body.route;
  via.origin = req.body.origin;
  via.destination = req.body.destination;
  via.middle = req.body.middle;
  via.distance = req.body.distance;
  via.duration = req.body.duration;
  console.log(via);

  via.save(function(err, viaStored){
    if (err) {
      res.status(500).send({message: 'Error al guardar la base de datos '+err});
    }else {
      res.status(200).send('1');
    }
  })
});

module.exports = router;
