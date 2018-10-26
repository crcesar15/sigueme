var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var moment = require('moment');
var router = express.Router();
var session = require('express-session');
var News = require('../models/news.js');
var Users = require('../models/users.js');
var Vias = require('../models/vias.js');
var Busqueda = require('../models/busqueda');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })


moment.locale('es');

/* vista inicial de usuarios*/
router.get('/', function(req, res) {
  if (!req.session._id) {
    req.session.destroy();
    res.redirect('/');
  }else {
    res.render('users/home',{user:req.session});
  }
});

router.get('/buscar/:inicio/:objetivo', async function(req, res, next){
  var n = parseInt(req.params.inicio);
  var objetivo = parseInt(req.params.objetivo);
  res.status(200).send({route:await Busqueda.buscar(n,objetivo)});
});

router.get('/search/:inicio/:objetivo', async function(req, res, next){
  var n = parseInt(req.params.inicio);
  var objetivo = parseInt(req.params.objetivo);
  res.status(200).send({route:await Busqueda.search(n,objetivo)});
});

router.post('/changeImage',upload.single('profile_img') , (req, res) => {
  data = {
          profileImage: req.file.path
          }
  if (req.session.profileImage !== '') {
    fs.unlinkSync(req.session.profileImage);
  }
  Users.findByIdAndUpdate(req.session._id,data,function(err){
    if (err) {
      res.status(200).send({message:'error al actualizar: '+err});
    }else{
      req.session.profileImage = data.profileImage;
      res.status(200).send('1');
    }
  });
});

router.delete('/deleteImage',upload.single('profile_img') , (req, res) => {
  data = {
          profileImage: ''
          }
  if (req.session.profileImage !== '') {
    fs.unlinkSync(req.session.profileImage);
  }
  Users.findByIdAndUpdate(req.session._id,data,function(err){
    if (err) {
      res.status(200).send({message:'error al actualizar: '+err});
    }else{
      req.session.profileImage = '';
      res.status(200).send('1');
    }
  });
});

router.post('/get_nodo/:distance', (req, res) => {
  var distance = req.params.distance;
  var lat_min = req.body.lat - (distance/111110);
  var lat_max = req.body.lat + (distance/111110);
  var lng_min = req.body.lng - (distance/111110);
  var lng_max = req.body.lng + (distance/111110);
  Vias.findOne({
    "middle.lat":
      {
        $gt:lat_min,
        $lt:lat_max
      },
    "middle.lng":
      {
        $gt:lng_min,
        $lt:lng_max
      }
  }, function(err, via){
    if (via) {
      res.status(200).send({nodo:via.nodo});
    }else {
      res.status(200).send({nodo:null});
    }
  })
});

router.post('/get_nodo_more/:distance', (req, res) => {
  var distance = req.params.distance;
  var lat_min = req.body.lat - (distance/111110);
  var lat_max = req.body.lat + (distance/111110);
  var lng_min = req.body.lng - (distance/111110);
  var lng_max = req.body.lng + (distance/111110);
  Vias.findOne({
    "middle.lat":
      {
        $gt:lat_min,
        $lt:lat_max
      },
    "middle.lng":
      {
        $gt:lng_min,
        $lt:lng_max
      }
  }, function(err, via){
    if (via) {
      res.status(200).send({via:via});
    }else {
      res.status(200).send({nodo:null});
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

//actualizar usuario
router.put('/update_profile/:id', (req, res) => {
  // let transporter = nodemailer.createTransport({
  //   host: 'smtp.gmail.com',
  //   port: 587,
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //       user: 'atareados.emi@gmail.com', // generated ethereal user
  //       pass: 'atareados123' // generated ethereal password
  //   }
  // });
  //
  // // setup email data with unicode symbols
  // let mailOptions = {
  //     from: '"Sigueme " <sigueme@gmail.com>', // sender address
  //     to: req.body.email, // list of receivers
  //     subject: 'Registro Exitoso', // Subject line
  //     html: "<strong>Registro exitoso</strong> <br><br> Bienvenido a nuestra comunidad, previo a disfrutar de todas las ventajas debemos verificar tu cuenta, ingresa al siguiente <a href='https://192.168.43.162:3000/activate/"+userStored._id +"'>enlace</a> <br><br> GRACIAS!"
  // };
  //
  // // send mail with defined transport object
  // transporter.sendMail(mailOptions, (error, info) => {
  //     if (error) {
  //       res.status(500).send(error);
  //       User.findById(userStored._id).remove();
  //     }else {
  //       res.status(200).send('1');
  //     }
  // });

  if (req.body.firstPassword) {
    if (req.body.firstPassword !== req.body.secondPassword) {
      res.status(200).send('0');
    }else {
      data = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: req.body.firstPassword
              }
      Users.findByIdAndUpdate(req.params.id,data,function(err){
        if (err) {
          res.status(200).send({message:'error al actualizar: '+err});
        }else{
          req.session.firstName = data.firstName;
          req.session.lastName = data.lastName;
          res.status(200).send('1');
        }
      });
    }
  }else {
    data = {
              firstName: req.body.firstName,
              lastName: req.body.lastName
            }
    Users.findByIdAndUpdate(req.params.id,data,function(err){
      if (err) {
        res.status(200).send({message:'error al actualizar: '+err});
      }else{
        req.session.firstName = data.firstName;
        req.session.lastName = data.lastName;
        res.status(200).send('1');
      }
    });
  }
});


//Noticias

router.get('/news', async function (req, res) {
  if (!req.session._id) {
    req.session.destroy();
    res.redirect('/');
  }else{
    var get_other_news = function(){
      return new Promise(function(response,reject){
        News.aggregate([
          {$match:{id_user:{$ne:mongoose.Types.ObjectId(req.session._id)}}},
          {$lookup: {
              from: 'users',
              localField:'id_user',
              foreignField: '_id',
              as: 'user'}
          }
        ])
        .exec(function(err, news) {
          if (err) {
            console.log(err);
          }
          response(news)
        });
      })
    }

    var get_my_news = function(){
      return new Promise(function(response,reject){
        News.find({'id_user':req.session._id})
        .select('_id title description created node')
        .exec(function(err, news) {
          if (err) {
            console.log(err);
          }
          response(news)
        });
      })
    }

    var news = await get_other_news();
    var my_news = await get_my_news();
    res.render('users/news',{
                              news: news,
                              my_news:my_news,
                              user:req.session,
                              moment:moment}
                            );
  }
});

router.get('/get_routes_from_news', (req, res) => {
  var vias = [];
  News.find({})
  .select('node')
  .exec(function(err, news) {
    if (err) {
      console.log(err);
    }else {
        for (var i = 0; i < news.length; i++) {
          Vias.find({nodo:news[i].node})
          .select('origin destination')
          .exec(function(err, via){
            if (err) {
              console.log(err);
            }else {
              vias = vias.concat(via)
              if (vias.length == news.length) {
                res.status(200).send({vias:vias});
              }
            }
          });
        }
    }
  });
});

//create_new

router.get('/create_new', (req, res) => {
  if (!req.session._id) {
    req.session.destroy();
    res.redirect('/');
  }else{
    res.render('users/create_new',{user:req.session});
  }
});

router.get('/profile', (req, res) => {
  if (!req.session._id) {
    req.session.destroy();
    res.redirect('/');
  }else{
    res.render('users/profile',{user:req.session});
  }
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


//view news
router.get('/news/:id', (req, res) => {
  if (!req.session._id) {
    req.session.destroy();
  }else {
    News.findById(req.params.id, function(err, news){
      if (err) {
        res.redirect('/');
      }else {
        res.render('users/view_new',{user:req.session,notice:news});
      }
    })
  }
});

//report new
router.put('/report_new', (req, res) => {
  if (!req.session._id) {
    req.session.destroy();
    res.redirect('/');
  }else{
    News.findByIdAndUpdate(req.body._id,{reports:req.body.reports}, function(err){
      if (err) {
        res.status(200).send({message: 'Error al eliminar de la base de datos '+err});
      }else {
        res.status(200).send('1');
      }
    })
  }
});


//delete news
router.delete('/news/:id/:node', (req, res) => {
  if (!req.session._id) {
    req.session.destroy();
    res.redirect('/');
  }else{
    News.findByIdAndRemove(req.params.id , function(err,news){
      if (err) {
        res.status(200).send({message: 'Error al eliminar de la base de datos '+err});
      }else {
        Vias.update(
          {nodo:req.params.node},
          {status:1},
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

//log-Out
router.get('/logout',function(req, res){
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
