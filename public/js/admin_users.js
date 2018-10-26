$('li#users').addClass('active');
var cars = ["Inactivo", "Activo"];

$('form#search_users').submit(function(event) {
  event.preventDefault();
  data = $(this).serializeArray();
  $.ajax({
    url: '/sgcn/admin/get_users_by_name',
    type: 'POST',
    dataType: 'JSON',
    data: data
  })
  .done(function(msg) {
    console.log(msg);
    if (msg) {
      html = '';
      html += '<table class="table table-bordered table-striped table-responsive">';
        html += '<tr>';
          html += '<th class="text-center">Nombre y Apellido</th>';
          html += '<th class="text-center">Usuario</th>';
          html += '<th class="text-center">Contraseña</th>';
          html += '<th class="text-center">Estado</th>';
          html += '<th class="text-center">Accion</th>';
        html += '</tr>';
        for (var i = 0; i < msg.length; i++) {
          html += '<tr>';
            html += '<td style="vertical-align:middle;" class="text-center">'+msg[i].nombre+' '+msg[i].apellido+'</td>';
            html += '<td style="vertical-align:middle;" class="text-center">'+msg[i].user+'</td>';
            html += '<td style="vertical-align:middle;" class="text-center">'+msg[i].pass+'</td>';
            html += '<td style="vertical-align:middle;" class="text-center">'+cars[msg[i].estado]+'</td>';
            if (msg[i].estado == 0) {
              html += '<td style="vertical-align:middle;" class="text-center"><button type="button" onclick="set_status('+msg[i].id_usuario+',1)" class="btn btn-success btn-sm"><span class="glyphicon glyphicon-check"></span> Habilitar</button></td>';
            }else {
              html += '<td style="vertical-align:middle;" class="text-center"><button type="button" onclick="set_status('+msg[i].id_usuario+',0)" class="btn btn-warning btn-sm"><span class="glyphicon glyphicon-ban-circle"></span> Deshabilitar</button></td>';
            }
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

var set_status = function(id,estado){
  $.ajax({
    url: '/sgcn/admin/set_status/'+id+'/'+estado,
    type: 'POST',
    dataType: 'JSON'
  })
  .done(function(msg) {
    if (msg == 1) {
      alert('Los Accesos del Usuario han sido Modificados');
      window.location.reload();
    }else {
      if (msg == 0) {
        alert('No pueden Modificar los Accesos de este Usuario');
      }else {
        alert('Ocurrio un Error');
        window.location.href = '/sgcn/admin';
      }
    }
  })
  .fail(function() {
    console.log("error");
  });

}
