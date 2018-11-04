var i = 0;
var origin;
var destination;
var map;
var flag = true;
var act_position = 0;
var ant_position;
var timer = 1000;
var distancia = 10;
var pos;

var get_nodo = function(position){
  return new Promise(function(response, reject){
    $.ajax({
      url: 'https://192.168.43.162:3000/users/get_nodo',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'JSON',
      data: JSON.stringify(position)
    })
    .done(function(msg) {
      response(msg);
    })
    .fail(function() {
      response(0);
    });
  });
}

var enable_map = function(addMarker) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat:-16.495637, lng:-68.133544
      };
      map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 17
      });
      act_position = pos;
      if (addMarker) {
        google.maps.event.addListener(map, 'click', function(event) {
          addMarker(event.latLng, map);
        });
      }
    }, function() {
      alert("error");
    });
  } else {
    alert("Se necesitan permisos o el navegador no soporta geolocalización");
  }
};
// Geolocation
var get_geolocation = function() {
  ant_position = act_position;
  // ant_position = {
  // 		        lat: -16.544622,
  // 		        lng: -68.084914
  // 		      };
  navigator.geolocation.getCurrentPosition(function(position) {
    pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    act_position = pos;
  });
  validate(act_position);
  flag = true;
}

var validate = function(act_position) {
  if (ant_position) {
    x1 = ant_position.lat;
    y1 = ant_position.lng;
    x2 = act_position.lat;
    y2 = act_position.lng;
    distance = Math.sqrt((Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)));
    distance = distance * 40076;
    if (distance < distancia) {
      timer = timer * 1.5;
      distancia = distancia * 1.3;
      if (timer > 30000) {
        timer = 30000;
        distancia = 100;
      }
    } else {
      timer = 1000;
    }
    // console.log('position: '+ant_position);
    // console.log('distancia: '+distancia);
    // console.log('tiempo: '+timer);
  } else {
    // algoritmo de logica difusa
    timer = 1000;
  }
  setTimeout(get_geolocation, timer);
}
