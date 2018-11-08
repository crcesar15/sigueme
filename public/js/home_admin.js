$('li#home').addClass('active');
var map2;
var draws = [];
$(document).ready(function() {
  var myStyles =[
      {
          featureType: "poi",
          elementType: "labels",
          stylers: [
                { visibility: "off" }
          ]
      }
  ];
  map2 = new google.maps.Map(document.getElementById('map2'), {
    center: {lat:-16.495670, lng:-68.133529},
    zoom: 16,
    streetViewControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: myStyles
  });
  get_traffic();
});

var get_traffic = function(){
  $.ajax({
    url: 'https://192.168.43.162:3000/admin/get_traffic',
    type: 'GET',
    dataType: 'JSON',
  })
  .done(function(msg) {
    msg = msg.via
    for (var i = 0; i < msg.length; i++) {

      switch (true) {
        case (msg[i].traffic < 26):
          color = '#23aa01'
          break;
        case (msg[i].traffic < 51):
          color = '#ffc700'
          break;
        case (msg[i].traffic < 75):
          color = '#ff8826'
          break;
        case (msg[i].traffic < 101):
          color = '#ff2626'
          break;
      }
      addLine(msg[i], map2, color);
    }
  })
  .fail(function() {
    console.log("error");
  });
}

var addLine = function (coords,map,color) {
  origen = {
    lng: coords.origin.lng,
    lat: coords.origin.lat
  }
  destino = {
    lng: coords.destination.lng,
    lat: coords.destination.lat
  }
  coordenadas = [origen,destino];
  flightPath = new google.maps.Polyline({
    path: coordenadas,
    strokeColor: color,
    strokeOpacity: 1.0,
    strokeWeight: 3
  });
  draws = draws.concat([flightPath]);
  flightPath.setMap(map);
}

var actualizar = function(){
  for (var i = 0; i < draws.length; i++) {
    draws[i].setMap(null);
  }
  draws = [];
  get_traffic();
}
