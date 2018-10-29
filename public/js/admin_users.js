$('li#users').addClass('active');
var cars = ['Sin Verificar', 'Activo', 'Bloqueado']
$('form#search_users').submit(function(event) {
  event.preventDefault();
  data = {
    name: $('input#name').val(),
    type: $('select#type').val()
  }
  console.log(data);
  $.ajax({
    url: 'https://192.168.43.162:3000/admin/get_users',
    type: 'POST',
    contentType: 'application/json',
    dataType: 'JSON',
    data: JSON.stringify(data)
  })
  .done(function(msg) {
    console.log(msg.users);
    if (msg.users.length) {
      html = '';
      html += '<table class="table table-bordered table-striped">';
        html += '<tr>';
          html += '<th class="text-center">Nombre y Apellido</th>';
          html += '<th class="text-center">Email</th>';
          html += '<th class="text-center">Estado</th>';
          html += '<th class="text-center">Accion</th>';
        html += '</tr>';
        for (var i = 0; i < msg.users.length; i++) {
          html += '<tr>';
            html += '<td style="vertical-align:middle;" class="text-center">'+msg.users[i].firstName+' '+msg.users[i].lastName+'</td>';
            html += '<td style="vertical-align:middle;" class="text-center">'+msg.users[i].email+'</td>';
            html += '<td style="vertical-align:middle;" class="text-center">'+cars[msg.users[i].status]+'</td>';
            if (msg.users[i].status == 0) {
              html += '<td style="vertical-align:middle;" class="text-center"><button type="button" onclick="delete_user(\''+msg.users[i]._id+'\')" class="btn btn-danger btn-sm"><span class="fas fa-trash-alt"></span>Eliminar</button></td>';
            }else {
              if (msg.users[i].status == 1) {
                  html += '<td style="vertical-align:middle;" class="text-center"><button type="button" onclick="set_status(\''+msg.users[i]._id+'\',2)" class="btn btn-warning btn-sm"><span class="fa fa-ban"></span> Deshabilitar</button></td>';
              }else {
                  html += '<td style="vertical-align:middle;" class="text-center"><button type="button" onclick="set_status(\''+msg.users[i]._id+'\',1)" class="btn btn-success btn-sm"><span class="fas fa-check-circle"></span> Habilitar</button></td>';
              }
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
    url: 'https://192.168.43.162:3000/admin/set_user_status/'+id+'/'+estado,
    type: 'PUT',
    dataType: 'JSON'
  })
  .done(function(msg) {
    if (msg == 1) {
      alert('Los Accesos del Usuario han sido Modificados');
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

var delete_user = function(id){
  $.ajax({
    url: 'https://192.168.43.162:3000/admin/delete_user/'+id,
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
