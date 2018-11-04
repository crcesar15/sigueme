var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var User = require('../models/users');
var Vias = require('../models/vias');
var Busqueda = require('../models/busqueda');
var Fuzzy = require('../models/fuzzy');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session._id){
    res.render('home');
  }else{
    res.redirect('/users');
  }
});

router.get('/fuzzy/:data', (req, res) => {
  var result = Fuzzy.get_fuzzy(req.params.data);
  res.status(200).send(result);
});

// verificar login
router.post('/login', function(req, res, next){
    User.findOne({
      email: req.body.user,
      password: req.body.password,
    }).
    select({_id:1,firstName:1,lastName:1,email:1,status:1,profileImage:1}).
    exec(function(err, user){
      if (err) {
        res.status(500).send(err);
      }else {
        if (user == null) {
          res.status(200).send('0');
        }else {
          if (req.body.user == 'admin@admin.gob') {
            req.session.admin = 1;
            req.session._id = user._id;
            req.session.firstName = user.firstName;
            req.session.lastName = user.lastName;
            req.session.email = user.email;
            req.session.profileImage = user.profileImage;
            res.status(200).send('4');
          }else {
            if (user.status == 1) {
              req.session._id = user._id;
              req.session.firstName = user.firstName;
              req.session.lastName = user.lastName;
              req.session.email = user.email;
              req.session.profileImage = user.profileImage;
              res.status(200).send('1');
            }else{
              if (user.status == 0) {
                res.status(200).send('2');
              }else {
                res.status(200).send('3');
              }
            }
          }
        }
      }
    });
  // }
});
//activar cuenta
router.get('/activate/:_id', function(req, res, next) {
  var userId = req.params._id;
  var update = {status:1};
  User.findByIdAndUpdate(userId, update, function(err, productUpdated){
    if (err) {
      res.status(500).send(err);
    }else {
      if (productUpdated) {
        res.redirect('/');
      }else {
        res.status(200).send({product:productUpdated});
      }
    }
  })
});
//registrar usuario
router.post('/register', function(req, res, next){

  var user = new User();

  if (req.body.firstPassword !== req.body.secondPassword) {
    res.status(200).send('0');
  }else {
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.password = req.body.firstPassword;
    user.save(function(err, userStored){
      if (err) {
        res.status(200).send({message: 'Error al guardar la base de datos '+err,code:1062});
      }else {
        let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
              user: 'atareados.emi@gmail.com', // generated ethereal user
              pass: 'atareados123' // generated ethereal password
          }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Sigueme " <sigueme@gmail.com>', // sender address
            to: req.body.email, // list of receivers
            subject: 'Registro Exitoso', // Subject line
            html: "<strong>Registro exitoso</strong> <br><br> Bienvenido a nuestra comunidad, previo a disfrutar de todas las ventajas debemos verificar tu cuenta, ingresa al siguiente <a href='https://192.168.43.162:3000/activate/"+userStored._id +"'>enlace</a> <br><br> GRACIAS!"
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              res.status(500).send(error);
              User.findById(userStored._id).remove();
            }else {
              res.status(200).send('1');
            }
        });
      }
    })
  }
});

module.exports = router;
