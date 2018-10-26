var map;
var origin_marker;
var destination_marker;
var changed = false;
var origin_node = null;
var destination_node = null;
var draws = [];

$('li#home').addClass('active');

$(document).ready(function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var myStyles =[
          {
              featureType: "poi",
              elementType: "labels",
              stylers: [
                    { visibility: "off" }
              ]
          }
      ];

      map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:-16.492097, lng:-68.137898},
        zoom: 17,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: myStyles
      });

      google.maps.event.addListener(map, 'click', function(event) {
        set_marker(map,event.latLng);
      });

      act_position = pos;
      set_news();

    });
  } else {
    alert("Se necesitan permisos o el navegador no soporta geolocalización");
  }
  set_places();
  setTimeout(get_geolocation, 1000);
});

$('input#from_places').click(function(event) {
  changed = false;
});
$('input#to_places').click(function(event) {
  changed = true;
});

var set_places = function(){
  var defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-16.506336, -68.143524), //down
    new google.maps.LatLng(-16.482357, -68.121815) //up
  );

  var options = {
    bounds: defaultBounds,
    types: []
  };

  var from_places = new google.maps.places.Autocomplete(document.getElementById('from_places'),options);
  var to_places = new google.maps.places.Autocomplete(document.getElementById('to_places'),options);
  from_places.setOptions({strictBounds: true});
  to_places.setOptions({strictBounds: true});

  google.maps.event.addListener(from_places, 'place_changed',function(){
    var from_place = from_places.getPlace();
    var from_address = from_place.formatted_address;
    pos = {
      lat: from_place.geometry.location.lat(),
      lng: from_place.geometry.location.lng()
    }
    map.setCenter(pos);
    set_marker(map, pos);
  });

  google.maps.event.addListener(to_places, 'place_changed',function(){
    var to_place = to_places.getPlace();
    var to_address = to_place.formatted_address;
    pos = {
      lat: to_place.geometry.location.lat(),
      lng: to_place.geometry.location.lng()
    }
    map.setCenter(pos);
    set_marker(map, pos, 'Destino');
  });
}

var get_nodo = function(position,distance){
  return new Promise(function(response, reject){
    $.ajax({
      url: 'https://192.168.43.162:3000/users/get_nodo/'+distance,
      type: 'POST',
      contentType: 'application/json',
      dataType: 'JSON',
      data: JSON.stringify(position)
    })
    .done(function(msg) {
      response(msg.nodo);
    })
    .fail(function() {
      response(0);
    });
  });
}

var set_marker = async function(map,coords){
  var k;
  if (changed) {
    if (destination_marker) {
      destination_marker.setMap(null);
    }
    if ($('input#to_places').val() == '') {
      $('input#to_places').val('Selección en el Mapa');
    }
    var image = {
      url: 'https://192.168.43.162:3000/img/origin_1.png',
    };
    var marker = new google.maps.Marker({
      position: coords,
      label:{text:'Destino', color: '#213046', fontWeight: 'bold',fontSize:'20px'},
      icon: image
    });
    k = 1;
    destination_node = null;
    while (destination_node == null && k < 7) {
      destination_node = await get_nodo(coords,k*10);
      k = k + 1;
    }
    console.log('destino: '+destination_node);
    marker.setMap(map);
    destination_marker = marker;
  }else {
    if (origin_marker) {
      origin_marker.setMap(null);
    }
    if ($('input#from_places').val() == '') {
      $('input#from_places').val('Selección en el Mapa');
    }
    var image = {
      url: 'https://192.168.43.162:3000/img/destination_1.png',
    };
    var marker = new google.maps.Marker({
      position: coords,
      label:{text:'Origen', color: '#213046', fontWeight: 'bold',fontSize:'20px'},
      icon: image
    });
    k = 1;
    origin_node = null;
    while (origin_node == null && k < 7) {
      origin_node = await get_nodo(coords,k*10);
      k = k + 1;
    }
    console.log('origen: '+origin_node);
    marker.setMap(map);
    origin_marker = marker;
  }
};

var get_route = function(){
  if (origin_marker && destination_marker) {
    console.log(origin_node);
    console.log(destination_node);
    if (origin_node != null && destination_node != null) {
      $.ajax({
        url: 'https://192.168.43.162:3000/users/buscar/'+origin_node+'/'+destination_node,
        type: 'GET',
        dataType: 'JSON',
        beforeSend: function(){
          $('div#alert_route').fadeIn(1000);
          $('div#alert_route').html('Estamos calculando la mejor Ruta...');
        }
      })
      .done(function(msg) {
        msg1 = msg.route.ruta1;
        msg2 = msg.route.ruta2;
        console.log(msg1);
        console.log(msg2);

        var tiempo = 0;
        var tiempo1 = 0;
        var tiempo2 = 0
        var distancia = 0;
        console.log('busca:'+msg2[0].nodo);
        console.log('destino:'+destination_node);
        if (msg2[0].nodo == destination_node) {
          for (var i = 0; i < msg1.length; i++) {
            // addLine(msg1[i], map, '#429bcd');
            tiempo1 = tiempo1 + (msg1[i].duration + msg1[i].duration * (msg1[i].traffic/100));
            // distancia = distancia + msg1[i].distance;
          }
          for (var i = 0; i < msg2.length; i++) {
            // addLine(msg1[i], map, '#429bcd');
            tiempo2 = tiempo2 + (msg2[i].duration + msg2[i].duration * (msg2[i].traffic/100));
            // distancia = distancia + msg1[i].distance;
          }
          console.log('tiempo1: '+tiempo1);
          console.log('tiempo2: '+tiempo2);
          if (tiempo1 < tiempo2) {
            console.log('tiempo1');
            for (var i = 0; i < msg2.length; i++) {
              addLine(msg2[i], map, '#9a9a9a');
            }
            for (var i = 0; i < msg1.length; i++) {
              addLine(msg1[i], map, '#429bcd');
              tiempo = tiempo1;
              distancia = distancia + msg1[i].distance;
            }
          } else {
            console.log('tiempo2');
            for (var i = 0; i < msg1.length; i++) {
              addLine(msg1[i], map, '#9a9a9a');
            }
            for (var i = 0; i < msg2.length; i++) {
              addLine(msg2[i], map, '#429bcd');
              tiempo = tiempo2;
              distancia = distancia + msg2[i].distance;
            }
          }
        }else {
          for (var i = 0; i < msg1.length; i++) {
            addLine(msg1[i], map, '#429bcd');
            tiempo1 = tiempo1 + (msg1[i].duration + msg1[i].duration * msg1[i].traffic/100);;
            distancia = distancia + msg1[i].distance;
          }
          tiempo = tiempo1;
        }

        tiempo = Math.ceil(tiempo/60);
        $('div#alert_route').fadeIn(1000);
        if (distancia > 999) {
          distancia = distancia/1000;
          $('div#alert_route').html('<strong>El tiempo de Recorrido es de '+tiempo+' min. y una distancia de '+distancia+' Kilometros</strong>');
        }else {
          $('div#alert_route').html('<strong>El tiempo de Recorrido es de '+tiempo+' min. y una distancia de '+distancia+' metros</strong>');
        }
      })
      .fail(function() {
        console.log("error");
      });
    }else {
        alert('No se puede encontrar Ruta')
    }
  }else {
    if (origin_marker) {
      $('input#to_places').focus();
    }else {
      $('input#from_places').focus();
    }
  }
}

var set_news = function(){
  $.ajax({
    url: 'https://192.168.43.162:3000/users/get_routes_from_news',
    type: 'GET'
  })
  .done(function(msg) {
    vias = msg.vias;
    for (var i = 0; i < vias.length; i++) {
      addLine(vias[i],map,'#ff0000');
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
  // map.setCenter(origen);
  // if (i != 0) {
  //   console.log('entro');
  //   flightPath.setMap(null);
  // }
  flightPath = new google.maps.Polyline({
    path: coordenadas,
    strokeColor: color,
    strokeOpacity: 1.0,
    strokeWeight: 5
  });
  draws = draws.concat([flightPath]);
  flightPath.setMap(map);
}

var clear_map = function(){
  for (var i = 0; i < draws.length; i++) {
    draws[i].setMap(null);
  }
  draws = [];
  $('div#alert_route').fadeOut(100);
  set_news();
}
