$('li#reports').addClass('active');
var ant_marker;
var event_direction;
var flightPath = null;
var nodo;
var myChart;
var weak = [];
var transit;
var days = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
var hours = ["6:00","7:00","8:00","9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00",]
var selectWeak = $('select#selectWeak');
var ctx = $("#myChart");
var chartData = {
    type: 'line',
    data: {
        labels: days,
        datasets: [{
            label: '% de Trafico Vehicular',
            backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(54, 162, 235, 0.2)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
};
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
  weak = await get_transit(event_node._id);
  changeChart('0');
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
  // if (i != 0) {
  //   console.log('entro');
  //   flightPath.setMap(null);
  // }
  flightPath = new google.maps.Polyline({
    path: coordenadas,
    strokeColor: '#375179',
    strokeOpacity: 1.0,
    strokeWeight: 6
  });
  flightPath.setMap(map);
  i = 1;
}

$(document).ready(function() {
  enable_map(addMarker);
  myChart = new Chart(ctx, chartData);
});

var get_transit = function(id){
  console.log(id);
  return new Promise(function(res,rej){
    $.ajax({
      url: 'https://192.168.43.162:3000/admin/get_transit/'+id,
      type: 'GET',
      dataType: 'JSON'
    })
    .done(function(msg) {
      transit = msg.transit[0].traffic
      for (var i = 0; i < transit.length; i++) {
        weak[i] = mean(transit[i]);
      }
      res(weak);
    })
    .fail(function() {
      res(0);
    });
  });
};

var changeChart = function(val){
  myChart.destroy();
  if (val == 0) {
    chartData.type = 'bar';
  }else {
    chartData.type = 'line';
  }
  myChart = new Chart(ctx,chartData);
  switch (val) {
    case '0':
      selectWeak.focus();
      selectWeak.val(0);
      myChart.data.datasets[0].data = weak;
      myChart.data.labels = days;
      myChart.update();
      break;
    case '1':
      myChart.data.datasets[0].data = transit[0].traffic;
      myChart.data.labels = hours;
      myChart.update();
      break;
    case '2':
      myChart.data.datasets[0].data = transit[1].traffic;
      myChart.data.labels = hours;
      myChart.update();
      break;
    case '3':
      myChart.data.datasets[0].data = transit[2].traffic;
      myChart.data.labels = hours;
      myChart.update();
      break;
    case '4':
      myChart.data.datasets[0].data = transit[3].traffic;
      myChart.data.labels = hours;
      myChart.update();
      break;
    case '5':
      myChart.data.datasets[0].data = transit[4].traffic;
      myChart.data.labels = hours;
      myChart.update();
      break;
    case '6':
      myChart.data.datasets[0].data = transit[5].traffic;
      myChart.data.labels = hours;
      myChart.update();
      break;
    case '7':
      myChart.data.datasets[0].data = transit[6].traffic;
      myChart.data.labels = hours;
      myChart.update();
      break;
  }
}

function mean(numbers) {
    numbers = numbers.traffic
    var total = 0, i;
    for (i = 0; i < numbers.length; i += 1) {
        total += numbers[i];
    }
    return total / numbers.length;
}
