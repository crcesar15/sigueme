$('li#news').addClass('active');
// Adds a marker to the map.
var map = 0;
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
  flightPath = new google.maps.Polyline({
    path: coordenadas,
    strokeColor: '#ff0000',
    strokeOpacity: 1.0,
    strokeWeight: 5,
  });
  flightPath.setMap(map);
}

$(document).ready(function() {
  $.ajax({
    url: 'https://192.168.43.162:3000/users/get_nodo_info/'+nodo,
    type: 'GET',
    contentType: 'application/json'
  })
  .done(function(msg) {
    via = msg.via;
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 17,
      center: {lat:via.middle.lat,lng:via.middle.lng}
    });
    console.log('antes');
    addLine(via.origin.lng,via.origin.lat,via.destination.lng,via.destination.lat);
  })
  .fail(function() {
    console.log('error');
  });
  // addLine(via);
});

var set_marker = function(map,coords,label){
  var marker = new google.maps.Marker({
    position: coords,
    label:label
  });
  marker.setMap(map);
};;

var report = function(id,num){
  num = num + 1;
  datos = {
    _id:id,
    reports: num
  }
  $.ajax({
    url: 'https://192.168.43.162:3000/users/report_new',
    type: 'PUT',
    contentType: 'application/json',
    dataType: 'JSON',
    data: JSON.stringify(datos),
  })
  .done(function(msg) {
    if (msg == 1) {
      console.log(msg);
      console.log($('div#report_alert'));
      $('div#report_alert').html('<i class="fas fa-check-circle" aria-hidden></i> Su Reporte Ha Sido Enviado. ¡Gracias!');
      $('div#report_alert').fadeIn(3000,function(){
        window.location.href = 'https://192.168.43.162:3000/users/news';
      });
    }else{
      $('div#report_alert').html('<i class="fas fa-check-circle" aria-hidden></i> Ha ocurrido un error, lo sentimos');
      $('div#report_alert').fadeIn('3000', function() {
        window.location.href = 'https://192.168.43.162:3000/users/news';
      });
    }
  })
  .fail(function() {
    $('div#report_alert').html('<i class="fas fa-check-circle" aria-hidden></i> Ha ocurrido un error, lo sentimos');
    $('div#report_alert').fadeIn('slow', function() {
      window.location.href = 'https://192.168.43.162:3000/users/news';
    });
  });

}
