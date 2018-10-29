var express = require('express');
var router = express.Router();
var session = require('express-session');
var News = require('../models/news.js');
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
  if (req.session.admin == '2344871') {
    res.render('admin/news');
  }else {
    res.redirect('/');
  }
});

router.get('/logout', function(req, res) {
  if (req.params.id == '2344871') {
    res.render('admin/home');
  }else {
    res.redirect('/');
  }
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

router.post('/get_news', function(req, res) {
  var userRegex = new RegExp(req.body.name, 'i');
  if (req.body.type == '') {
    News.aggregate([
      {$match:{title: userRegex}},
      {$lookup: {
          from: 'users',
          localField:'id_user',
          foreignField: '_id',
          as: 'user'}
      }
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
      {$match:{$and:[{title: userRegex},{event_type:req.body.type}]}},
      {$lookup: {
          from: 'users',
          localField:'id_user',
          foreignField: '_id',
          as: 'user'}
      }
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

module.exports = router;
