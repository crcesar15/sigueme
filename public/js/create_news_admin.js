var ant_marker;
var event_direction;
// Adds a marker to the map.
function addMarker(location, map) {
  if(ant_marker != null){
    ant_marker.setMap(null);
  }
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  event_direction = location;
  ant_marker = marker;
}

$(document).ready(function() {
  enable_map(addMarker);
});

$('form#create_new').submit(function(event) {
  event.preventDefault();
  event_direction = {
      lat:event_direction.lat(),
      lng:event_direction.lng()
  }
  datos = {
    title: $('input#title').val(),
    description: $('textarea#description').val(),
    event_type: $('select#event_type').val(),
    location: event_direction
  }
  $.ajax({
    url: 'https://192.168.43.162:3000/users/create_new',
    type: 'POST',
    contentType: 'application/json',
    dataType: 'JSON',
    data: JSON.stringify(datos),
  })
  .done(function(msg) {
    console.log(msg);
  })
  .fail(function() {
    console.log("error");
  })

});
