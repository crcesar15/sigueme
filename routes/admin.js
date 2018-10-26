var express = require('express');
var router = express.Router();
var session = require('express-session');
var News = require('../models/news.js');
var Users = require('../models/users.js');
var Vias = require('../models/vias.js');
var Busqueda = require('../models/busqueda');
var mongoose = require('mongoose');
var moment = require('moment');

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

module.exports = router;
