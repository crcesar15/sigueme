$('li#news').addClass('active');
var ant_marker;
var event_direction;
var flightPath = null;
var nodo;
// Adds a marker to the map.
async function addMarker(location, map) {
  var k;
  if(flightPath != null){
    flightPath.setMap(null);
  }
  k = 1;
  event_node = null;
  location = {
    lat: location.lat(),
    lng: location.lng()
  }
  while (event_node == null && k < 7) {
    event_node = await get_nodo(location,k*10);
    k = k + 1;
  }
  addLine(event_node.origin.lng,event_node.origin.lat,event_node.destination.lng,event_node.destination.lat);
  nodo = event_node.nodo;
}

var get_nodo = function(position,distance){
  return new Promise(function(response, reject){
    $.ajax({
      url: 'https://192.168.43.162:3000/users/get_nodo_more/'+distance,
      type: 'POST',
      contentType: 'application/json',
      dataType: 'JSON',
      data: JSON.stringify(position)
    })
    .done(function(msg) {
      response(msg.via);
    })
    .fail(function() {
      response(0);
    });
  });
}

function addLine(origen_lng,origen_lat,destino_lng,destino_lat) {
  origen = {
    lng: origen_lng,
    lat: origen_lat
  }
  destino = {
    lng: destino_lng,
    lat: destino_lat
  }
  coordenadas = [origen,destino];
  event_direction = [origen,destino];
  console.log(coordenadas);
  // if (i != 0) {
  //   console.log('entro');
  //   flightPath.setMap(null);
  // }
  flightPath = new google.maps.Polyline({
    path: coordenadas,
    strokeColor: '#ffb000',
    strokeOpacity: 1.0,
    strokeWeight: 5
  });
  flightPath.setMap(map);
  i = 1;
}

$(document).ready(function() {
  enable_map(addMarker);
});

$('form#create_new').submit(function(event) {
  event.preventDefault();
  datos = {
    title: $('input#title').val(),
    description: $('textarea#description').val(),
    event_type: $('select#event_type').val(),
    location: nodo
  }
  console.log(datos);
  $.ajax({
    url: 'https://192.168.43.162:3000/users/create_new',
    type: 'POST',
    contentType: 'application/json',
    dataType: 'JSON',
    data: JSON.stringify(datos),
  })
  .done(function(msg) {
    if (msg == 1) {
      window.location.href = 'https://192.168.43.162:3000/users/news';
    }
  })
  .fail(function() {
    console.log("error");
  })

});
