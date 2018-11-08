var express = require('express');
var router = express.Router();
var session = require('express-session');
var News = require('../models/news.js');
var Transit = require('../models/transit.js');
var Users = require('../models/users.js');
var Vias = require('../models/vias.js');
var Busqueda = require('../models/busqueda');
var mongoose = require('mongoose');
var moment = require('moment');

moment.locale('es');

/* vista inicial de usuarios*/
router.get('/', function(req, res) {
  console.log(req.session.id);
  if (!req.session.admin) {
    req.session.destroy();
    res.redirect('/');
  }else {
    res.render('admin/home');
  }
});

router.get('/reports', function(req, res) {
  console.log(req.session.id);
  if (!req.session.admin) {
    req.session.destroy();
    res.redirect('/');
  }else {
    res.render('admin/reports');
  }
});

router.get('/add_new', function(req, res) {
  console.log(req.session.id);
  if (!req.session.admin) {
    req.session.destroy();
    res.redirect('/');
  }else {
    res.render('admin/add_new');
  }
});

router.get('/users', function(req, res) {
  if (!req.session.admin) {
    req.session.destroy();
    res.redirect('/');
  }else {
    res.render('admin/users');
  }
});


router.get('/news', function(req, res) {
  if (req.session.admin == 1) {
    res.render('admin/news');
  }else {
    res.redirect('/');
  }
});

router.get('/logout',function(req, res){
  req.session.destroy();
  res.redirect('/');
});

router.get('/get_traffic', function(req, res) {
  Vias.find({})
  .select('origin destination traffic')
  .exec(function(err, via){
    if (err) {
      console.log(err);
    }else {
      res.status(200).send({via:via});
    }
  });
});

router.post('/get_users', function(req, res) {
  var userRegex = new RegExp(req.body.name, 'i');
  if (req.body.type == '') {
    Users.find({$or:[{firstName: userRegex},{lastName: userRegex}]})
    .select('firstName lastName email status')
    .exec(function(err, users){
      if (err) {
        console.log(err);
      }else {
        res.status(200).send({users:users});
      }
    });
  }else {
    Users.find({$and:[{$or:[{firstName: userRegex},{lastName: userRegex}]},{status:req.body.type}]})
    .select('firstName lastName email status')
    .exec(function(err, users){
      if (err) {
        console.log(err);
      }else {
        res.status(200).send({users:users});
      }
    });
  }
});

router.put('/set_user_status/:_id/:status', (req, res) => {
  Users.findByIdAndUpdate(req.params._id,{status:req.params.status}, function(err){
    if (err) {
      res.status(200).send({message: 'Error al actualizar en la base de datos '+err});
    }else {
      res.status(200).send('1');
    }
  })
});

router.post('/create_new', function(req, res, next) {
  if (!req.session._id) {
    req.session.destroy();
    res.redirect('/');
  }else{
    var news = new News();
    news.id_user = req.session._id;
    news.title = req.body.title;
    news.description = req.body.description;
    news.event_type = req.body.event_type;
    news.node = req.body.location;

    news.save(function(err, newStored){
      if (err) {
        res.status(200).send({message: 'Error al guardar la base de datos '+err});
      }else {
        Vias.update(
          {nodo:req.body.location},
          {status:0},
          function(err){
            if (err) {
              console.log(err);
            }else {
              res.status(200).send('1');
            }
          }
        )
      }
    })
  }
});


router.post('/get_news', function(req, res) {
  var userRegex = new RegExp(req.body.title, 'i');
  if (req.body.type == '') {
    News.aggregate([
      {$match:{title: userRegex}},
      {$lookup: {
          from: 'users',
          localField:'id_user',
          foreignField: '_id',
          as: 'user'}
      },
      {$sort:{created:-1}}
    ])
    .exec(function(err, news){
      if (err) {
        console.log(err);
      }else {
        res.status(200).send({news:news});
      }
    });

  }else {
    News.aggregate([
      {$match:{$and:[{title: userRegex}, {event_type:parseInt(req.body.type)}]}},
      {$lookup: {
          from: 'users',
          localField:'id_user',
          foreignField: '_id',
          as: 'user'}
      },
      {$sort:{created:-1}}
    ])
    .exec(function(err, news){
      if (err) {
        console.log(err);
      }else {
        res.status(200).send({news:news});
      }
    });
  }
});

router.delete('/delete_user/:id', (req, res) => {
  Users.findByIdAndRemove(req.params.id , function(err,user){
    if (err) {
      res.status(200).send({message: 'Error al eliminar de la base de datos '+err});
    }else {
      res.status(200).send('1');
    }
  })
});

router.delete('/delete_new/:id/:node', (req, res) => {
  News.findByIdAndRemove(req.params.id , function(err,news){
    if (err) {
      res.status(200).send({message: 'Error al eliminar de la base de datos '+err});
    }else {
      Vias.update(
        {nodo:req.params.node},
        {status:1},
        function(err){
          if (err) {
            res.status(200).send('0');
            console.log(err);
          }else {
            res.status(200).send('1');
          }
        }
      )
    }
  })
});

router.put('/set_user_status/:_id/:status', (req, res) => {
  Users.findByIdAndUpdate(req.params._id,{status:req.params.status}, function(err){
    if (err) {
      res.status(200).send({message: 'Error al actualizar en la base de datos '+err});
    }else {
      res.status(200).send('1');
    }
  })
});

router.get('/get_nodo_info/:nodo', (req, res) => {
  Vias.findOne({
    "nodo":req.params.nodo
  }, function(err,via){
    if (via) {
      res.status(200).send({via:via});
    }else {
      res.status(200).send({via:null});
    }
  })
});

router.post('/set_traffic', (req, res) => {
  var transit = new Transit();
  transit.id_via = req.body.id_via;
  transit.traffic = req.body.traffic;
  transit.save(function(err,transit){
    if (err) {
      res.status(200).send('0');
    }else{
      res.status(200).send(transit);
    }
  });
});

router.get('/get_transit/:id', function(req, res) {
  id = req.params.id;
  console.log(id);
  Transit.aggregate([
    {$match:{id_via: mongoose.Types.ObjectId(id)}},
    {$lookup: {
        from: 'vias',
        localField:'id_via',
        foreignField: '_id',
        as: 'via'}
    },
  ])
  .exec(function(err, transit){
    if (err) {
      console.log(err);
    }else {
      res.status(200).send({transit:transit});
    }
  });
});


module.exports = router;
