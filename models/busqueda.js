var Vias = require('../models/vias');

var deleteFromOpened = function(opened,n){
                    var i = opened.indexOf(n);
                    if(i != -1) {
                      opened.splice(i, 1);
                    }
                    return opened;
                  };
var deleteNeighbors = function(opened, closed, neighbors){
                    // console.log('abiertos: '+opened);
                    // console.log('cerrados: '+closed);
                    // console.log('vecinos: '+neighbors);
                    for (var i = 0; i < opened.length; i++) {
                      j = neighbors.indexOf(opened[i]);
                      if(j != -1) {
                        neighbors.splice(j, 1);
                      }
                    }

                    for (var i = 0; i < closed.length; i++) {
                      j = neighbors.indexOf(closed[i]);
                      if(j != -1) {
                        neighbors.splice(j, 1);
                      }
                    }
                    // console.log('new-vecinos: '+ neighbors);
                    return neighbors;
                  };
var getNeighbors = function (actual){
  return new Promise(function(response,reject){
    Vias.findOne({
      nodo: actual
    }).
    select({neighbors:1}).
    exec(function(err, vias){
      if (err) {
        reject(err)
      }else {
        if (vias == null) {
          reject(err)
        }else {
          response(vias.neighbors);
        }
      }
    });
  });
}

var deleteFromOpened2 = function(opened,n){
                    var i = opened.indexOf(n);
                    if(i != -1) {
                      opened.splice(i, 1);
                    }
                    return opened;
                    };

var deleteNeighbors2 = function(opened, closed, neighbors){
                    // console.log('abiertos: '+opened);
                    // console.log('cerrados: '+closed);
                    // console.log('vecinos: '+neighbors);

                    for (var i = 0; i < opened.length; i++) {
                      for (var j = 0; j < neighbors.length; j++) {
                        if (neighbors[j].nodo == opened[i].nodo) {
                          neighbors.splice(j, 1);
                        }
                      }
                    }

                    for (var i = 0; i < closed.length; i++) {
                      for (var j = 0; j < neighbors.length; j++) {
                        if (neighbors[j].nodo == closed[i].nodo) {
                          neighbors.splice(j, 1);
                        }
                      }
                    }
                    // console.log('new-vecinos: '+ neighbors);
                    return neighbors;
                  };

var getNeighbors2 = function (actual){
  // console.log(actual);
  var neighbors = [];
  return new Promise(function(response,reject){
    Vias.findOne({
      nodo: actual,
      status: 1
    }).
    select({neighbors:1}).
    exec(function(err, vias){
      if (err) {
        reject(err)
      }else {
        if (vias == null) {
          response(neighbors);
        }else {
          for (var i = 0; i < vias.neighbors.length; i++) {
            neighbors = neighbors.concat([{nodo:vias.neighbors[i],antecesor:actual}]);
          }
          response(neighbors);
        }
      }
    });
  });
}

var getInfo = function (actual){
  return new Promise(function(response,reject){
    Vias.findOne({
      nodo: actual
    }).
    select({origin:1, destination:1,duration:1, distance:1, nodo:1, traffic:1}).
    exec(function(err, vias){
      if (err) {
        reject(err)
      }else {
        if (vias == null) {
          reject(err)
        }else {
          response(vias);
        }
      }
    });
  });
}

module.exports = {
  search: async function(actual,objetivo){
    var opened = [actual];
    var closed = [];
    var route = [];
    var i = 0;
    var flag = false;
    while (flag == false && opened != []) {
      // console.log('abiertos: '+opened);
      if (opened[0] == objetivo) {
        closed = closed.concat(opened[i]);
        // console.log('cerrados-fin: '+closed);
        flag = true;
      }else {
        // console.log('cerrados-sigue: '+closed);
        actual = opened[0];
        // console.log('abiertos: '+opened);
        closed = closed.concat([actual]);
        // console.log('cerrados: '+closed);
        opened = deleteFromOpened(opened,actual);
        // console.log('new-abiertos: '+opened);
        neighbors = await getNeighbors(actual);
        // console.log('vecinos:' +neighbors);
        opened = opened.concat(deleteNeighbors(opened, closed, neighbors));
        // console.log('second-new-abiertos: '+opened);
      }
    }
    ruta = closed;
    route = route.concat(ruta[ruta.length-1]);

    for (var i = ruta.length-2; i >-1 ; i--) {
      neighbors = await getNeighbors(ruta[i]);
      j = neighbors.indexOf(ruta[i+1]);
      if (j != -1) {
        route = route.concat(ruta[i]);
      }else {
        ruta.splice(i, 1);
      }
    }

    data = []

    for (var i = 0; i < ruta.length; i++) {
      data = data.concat(await getInfo(ruta[i]));
    }
    return new Promise(function(res, rej){
      res(data);
    });
  },
  buscar: async function(actual,objetivo){
    var origen = actual;
    var opened = [{nodo:actual,antecesor:0}];
    var closed = [];
    var route = [];
    var i = 0;
    var flag = false;
    while (flag == false && opened.length) {
      // console.log('abiertos');
      // console.log(opened);
      if (opened[0].nodo == objetivo) {
        closed = closed.concat(opened[i]);
        // console.log('cerrados-fin: '+closed);
        flag = true;
      }else {
        // console.log('cerrados');
        actual = opened[0];
        // console.log('abiertos: '+opened);
        closed = closed.concat([actual]);
        // console.log(closed);
        // console.log('cerrados: '+closed);
        opened = deleteFromOpened2(opened,actual);
        // console.log('new-abiertos: '+opened);
        neighbors = await getNeighbors2(actual.nodo);
        // console.log('vecinos');
        // console.log(neighbors);
        opened = opened.concat(deleteNeighbors2(opened, closed, neighbors));
        // console.log('second-new-abiertos: '+opened);
      }
    }
    ruta = closed;
    route = [ruta[ruta.length-1]];
    var antecesor = ruta[ruta.length-1].antecesor;
    for (var i = ruta.length -1; i >= 0; i--) {
      if (ruta[i].nodo == antecesor) {
        antecesor = ruta[i].antecesor;
        route = route.concat(ruta[i]);
      }
    }
    data = []
    // console.log(ruta);
    // console.log(route);
    for (var i = 0; i < route.length; i++) {
      data = data.concat(await getInfo(route[i].nodo));
    }

    var actual = origen;
    var opened = [{nodo:actual,antecesor:0}];
    // console.log(route);
    var closed = [route[route.length-2]];
    // console.log(closed);
    var route = [];
    var i = 0;
    var flag = false;
    while (flag == false && opened.length) {
      // console.log('abiertos');
      // console.log(opened);
      if (opened[0].nodo == objetivo) {
        closed = closed.concat(opened[i]);
        // console.log('cerrados-fin: '+closed);
        flag = true;
      }else {
        // console.log('cerrados');
        actual = opened[0];
        // console.log('abiertos: '+opened);
        closed = closed.concat([actual]);
        // console.log(closed);
        // console.log('cerrados: '+closed);
        opened = deleteFromOpened2(opened,actual);
        // console.log('new-abiertos: '+opened);
        neighbors = await getNeighbors2(actual.nodo);
        // console.log('vecinos');
        // console.log(neighbors);
        opened = opened.concat(deleteNeighbors2(opened, closed, neighbors));
        // console.log('second-new-abiertos: '+opened);
      }
    }
    ruta = closed;
    route = [ruta[ruta.length-1]];
    var antecesor = ruta[ruta.length-1].antecesor;
    for (var i = ruta.length -1; i >= 0; i--) {
      if (ruta[i].nodo == antecesor) {
        antecesor = ruta[i].antecesor;
        route = route.concat(ruta[i]);
      }
    }
    data1 = []
    // console.log(ruta);
    // console.log(route);
    for (var i = 0; i < route.length; i++) {
      data1 = data1.concat(await getInfo(route[i].nodo));
    }

    result = {'ruta1': data, 'ruta2': data1}
    // console.log(result);
    return new Promise(function(res, rej){
      res(result);
    });
  }
}
