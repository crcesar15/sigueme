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
var puppeteer = require('puppeteer');
var fs = require('fs-extra');
var handlebars = require('handlebars');
var path = require('path');

moment.locale('es');

var compile = async function(templateName,id){
  var filePath = path.join(process.cwd(),'views',`${templateName}.hbs`);
  var html = await fs.readFile(filePath, 'utf-8');
  // console.log(html);
  // console.log(html);
  var data = await datos(id);
  console.log(data);
  var template = await handlebars.compile(html)
  return await handlebars.template(data);
}

/* vista inicial de usuarios*/
router.get('/', function(req, res) {
  // console.log(req.session.id);
  if (!req.session.admin) {
    req.session.destroy();
    res.redirect('/');
  }else {
    res.render('admin/home');
  }
});

router.get('/reports', function(req, res) {
  // console.log(req.session.id);
  if (!req.session.admin) {
    req.session.destroy();
    res.redirect('/');
  }else {
    res.render('admin/reports');
  }
});

router.get('/add_new', function(req, res) {
  // console.log(req.session.id);
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

router.get('/fill_traffic', (req, res) => {
  Vias.find({},'_id traffic',
    async function(err, vias) {
      if (vias) {
        res.render('admin/vias',{vias:vias});
      } else {
        console.log('error');
      }
    })
});

router.post('/set_traffic/:_id/:traffic', (req, res) => {
  // console.log(req.params);
  var transit = new Transit();
  percent = parseFloat(req.params.traffic);
  data = {
    id_via: req.params._id,
    traffic: [{
        traffic: [
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
        ]
      },
      {
        traffic: [
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
        ]
      },
      {
        traffic: [
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
        ]
      },
      {
        traffic: [
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
        ]
      },
      {
        traffic: [
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
        ]
      },
      {
        traffic: [
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
        ]
      },
      {
        traffic: [
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
          parseFloat(percent + ((Math.random() * 19) - 9)).toFixed(2),
        ]
      }
    ]
  }
  transit.id_via = data.id_via;
  transit.traffic = data.traffic;
  // console.log(transit);
  transit.save(function(err, transit) {
    if (err) {
      console.log(err);
      res.status(200).send('1');
    } else {
      res.status(200).send('1');
    }
  });
});

router.get('/get_transit/:id', function(req, res) {
  id = req.params.id;
  // console.log(id);
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

router.get('/get_pdf/:_id', async (req, res) => {
  var compile = async function(templateName,id){
    var filePath = path.join(process.cwd(),'views',`${templateName}.ejs`);
    var html = await fs.readFile(filePath, 'utf-8');
    // console.log(html);
    // console.log(html);
    // var data = await datos(id);
    var data = {title:'holass'}
    var template = await handlebars.compile(html)
    return handlebars.template(data);
  }

  var datos = function(id){
    return new Promise(function(res,rej){
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
         rej(err);
       }else {
         res(transit);
       }
     });
    });
  }
  try {
    var browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    var page = await browser.newPage();
    var content = await compile('reportes',req.params._id);
    // console.log(content);
    await page.setContent(content);
    await page.emulateMedia('screen');
    await page.pdf({
      path: 'public/files/report.pdf',
      format: 'letter',
      printBackground: true
    });
    console.log('done');
    await browser.close();
    process.exit();
  } catch (e) {
    console.log(e);
  }

});


module.exports = router;
