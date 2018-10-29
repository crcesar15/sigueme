$('li#news').addClass('active');
var cars = ['','Bloqueo, Manifestación','Evento Social','Mantenimiento de Vias','Otros']

$('form#search_news').submit(function(event) {
  event.preventDefault();
  data = {
    title: $('input#title').val(),
    type: $('select#type').val()
  }
  console.log(data);
  $.ajax({
    url: 'https://192.168.43.162:3000/admin/get_news',
    type: 'POST',
    contentType: 'application/json',
    dataType: 'JSON',
    data: JSON.stringify(data)
  })
  .done(function(msg) {
    console.log(msg);
    if (msg.news.length) {
      html = '';
      html += '<table class="table table-bordered table-striped">';
        html += '<tr>';
          html += '<th class="text-center">Usuario</th>';
          html += '<th class="text-center">Titulo</th>';
          html += '<th class="text-center">Descripción</th>';
          html += '<th class="text-center">Reportes</th>';
          html += '<th class="text-center">Creado</th>';
          html += '<th class="text-center">Tipo</th>';
          html += '<th class="text-center">Accion</th>';
        html += '</tr>';
        for (var i = 0; i < msg.news.length; i++) {
          html += '<tr>';
            html += '<td style="vertical-align:middle;" class="text-center">'+msg.news[i].user[0].firstName+' '+msg.news[i].user[0].lastName+'</td>';
            html += '<td style="vertical-align:middle;" class="text-center">'+msg.news[i].title+'</td>';
            html += '<td style="vertical-align:middle;" class="text-center">'+msg.news[i].description+'</td>';
            html += '<td style="vertical-align:middle;" class="text-center">'+msg.news[i].reports+'</td>';
            html += '<td style="vertical-align:middle;" class="text-center">'+moment(msg.news[i].created).format('L')+'</td>';
            html += '<td style="vertical-align:middle;" class="text-center">'+cars[msg.news[i].event_type]+'</td>';
            html += '<td style="vertical-align:middle;" class="text-center"><button type="button" onclick="delete_new(\''+msg.news[i]._id+'\','+msg.news[i].node+')" class="btn btn-danger btn-sm"><span class="fas fa-trash-alt"></span>Eliminar</button></td>';
          html += '</tr>';
      }
      html += '</table>';
      $('div#result').html(html);
    }else {
      $('div#result').html('<h2 style="padding-top:10%;padding-bottom:10%;color:rgb(125, 125, 125)" class="text-center">No se Encontraron Coincidencias</h2>');
    }
  })
  .fail(function() {
    console.log("error");
  });
});

var delete_new = function(id,nodo){
  $.ajax({
    url: 'https://192.168.43.162:3000/admin/delete_new/'+id+'/'+nodo,
    type: 'DELETE',
    dataType: 'JSON'
  })
  .done(function(msg) {
    if (msg == 1) {
      alert('Eliminado Correctamente');
      window.location.reload();
    }else {
      alert('Ocurrio un Error');
      window.location.reload();
    }
  })
  .fail(function() {
    console.log("error");
  });

}
