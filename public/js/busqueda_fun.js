buscar: async function(actual,objetivo){
  var opened = [{nodo:actual,antecesor:0}];
  var closed = [];
  var route = [];
  var i = 0;
  var k = 0;
  var flag = false;
  while (flag == false && opened != []) {
    // console.log('abiertos');
    // console.log(opened);
    if (opened[0].nodo == objetivo && k > 0) {
      k = k + 1;
      closed = closed.concat(opened[i]);
      // console.log('cerrados-fin: '+closed);
      flag = true;
    }else {
      if (opened[0].nodo == objetivo) {
        ruta1 = opened[0];
      }
      // console.log('cerrados');
      // actual = opened[0];
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
  console.log(ruta);
  route = [ruta[ruta.length-1].nodo];
  var antecesor = ruta[ruta.length-1].antecesor;
  for (var i = ruta.length -1; i >= 0; i--) {
    if (ruta[i].nodo == antecesor) {
      antecesor = ruta[i].antecesor;
      route = route.concat(ruta[i].nodo);
    }
  }
  data = []
  // console.log(ruta);
  // console.log(route);
  for (var i = 0; i < route.length; i++) {
    data = data.concat(await getInfo(route[i]));
  }
  ruta = closed.concat(ruta1);
  route = [ruta[ruta.length-1].nodo];
  var antecesor = ruta[ruta.length-1].antecesor;
  for (var i = ruta.length -1; i >= 0; i--) {
    if (ruta[i].nodo == antecesor) {
      antecesor = ruta[i].antecesor;
      route = route.concat(ruta[i].nodo);
    }
  }
  data1 = []
  for (var i = 0; i < route.length; i++) {
    data1 = data1.concat(await getInfo(route[i]));
  }
  res = [data, data1];
  return new Promise(function(res, rej){
    res(data);
  });
}


buscar: async function(actual,objetivo){
  var opened = [{nodo:actual,antecesor:0}];
  var closed = [];
  var route = [];
  var i = 0;
  var k = 0;
  var flag = false;
  while (flag == false && opened.length) {
    console.log('abiertos');
    console.log(opened);
    if (k > 1 && opened[0].nodo == objetivo) {
      closed = closed.concat(opened[i]);
      console.log('segunda ruta:');
      console.log(opened[0]);
      // console.log('cerrados-fin: '+closed);
      flag = true;
    }else {
      actual = opened[0];
      if (opened[0].nodo == objetivo) {
        if (k == 0) {
          console.log('primera ruta');
          ruta1 = opened[0];
          console.log(ruta1);
        }
        k = k + 1;
        // console.log('abiertos: opened);
      }else {
        // console.log('cerrados');
        closed = closed.concat([actual]);
        // console.log(closed);
        // console.log('cerrados: '+closed
      }
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
  // console.log(ruta);
  route = [ruta[ruta.length-1].nodo];
  var antecesor = ruta[ruta.length-1].antecesor;
  for (var i = ruta.length -1; i >= 0; i--) {
    if (ruta[i].nodo == antecesor) {
      antecesor = ruta[i].antecesor;
      route = route.concat(ruta[i].nodo);
    }
  }
  data = []
  // console.log(ruta);
  // console.log(route);
  for (var i = 0; i < route.length; i++) {
    data = data.concat(await getInfo(route[i]));
  }
  ruta = closed.concat(ruta1);
  route = [ruta[ruta.length-1].nodo];
  var antecesor = ruta[ruta.length-1].antecesor;
  for (var i = ruta.length -1; i >= 0; i--) {
    if (ruta[i].nodo == antecesor) {
      antecesor = ruta[i].antecesor;
      route = route.concat(ruta[i].nodo);
    }
  }
  data1 = []
  for (var i = 0; i < route.length; i++) {
    data1 = data1.concat(await getInfo(route[i]));
  }
  result = {'ruta1': data, 'ruta2': data1}
  // console.log(result);
  return new Promise(function(res, rej){
    res(result);
  });
}


buscar: async function(actual,objetivo){
  var opened = [{nodo:actual,antecesor:0}];
  var closed = [];
  var route = [];
  var i = 0;
  var flag = false;
  while (flag == false && opened != []) {
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
  route = [ruta[ruta.length-1].nodo];
  var antecesor = ruta[ruta.length-1].antecesor;
  for (var i = ruta.length -1; i >= 0; i--) {
    if (ruta[i].nodo == antecesor) {
      antecesor = ruta[i].antecesor;
      route = route.concat(ruta[i].nodo);
    }
  }
  data = []
  // console.log(ruta);
  // console.log(route);
  for (var i = 0; i < route.length; i++) {
    data = data.concat(await getInfo(route[i]));
  }
  return new Promise(function(res, rej){
    res(data);
  });
}
