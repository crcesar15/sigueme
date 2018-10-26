var limpiar = function(){
  document.getElementById("register").reset();
}

var first_upper  = function(input){
  dato = input.value;
		 aux = dato.split(" ");
		 dato = "";
		 for (var i = 0; i < aux.length; i++) {
		 		dato = dato + aux[i].charAt(0).toUpperCase();
				dato = dato + aux[i].substring(1).toLowerCase();
				if (i+1 !== aux.length) {
					dato = dato + " ";
				}
		 }
	input.value = dato;
}

$('form#register').submit(function(event) {
  data = {
    firstName: $('input#firstName').val(),
    lastName: $('input#lastName').val(),
    email: $('input#email').val(),
    firstPassword: $('input#firstPassword').val(),
    secondPassword: $('input#secondPassword').val()
  }
  var alert = $('div#alert_register');
  event.preventDefault();
  $.ajax({
    url: '/register',
    type: 'POST',
    contentType: 'application/json',
    dataType: 'JSON',
    data: JSON.stringify(data),
    beforeSend: function(){
                  alert.html('<br><div class="alert alert-warning text-center"><strong>Estamos Registrandote...</strong><img width="50" heigth="50" src="/img/loading.gif"></div>');
                  alert.fadeIn('400');
                }
  })
  .done(function(msg) {
    if (msg == 0) {
      alert.html('<br><div class="alert alert-danger text-center"><strong>Las Contraseñas deben ser Iguales</strong></div>');
    }
    if (msg == 1) {
      alert.html('<br><div class="alert alert-success text-center"><strong>Registrado Exitosamente, <br>Enviamos un E-mail de confirmación a tu correo</strong></div>');
      setTimeout(function() {
        alert.fadeOut('slow');
        location.reload();
      }, 3500);
    }else {
      if (msg.code == 1062) {
        alert.html('<br><div class="alert alert-warning text-center"><strong>Ya existe una cuenta con este correo</strong></div>');
      }
    }
  })
  .fail(function() {
    alert.html('<br><div class="alert alert-danger text-center"><strong>Algo Salio Mal...</strong></div>');
  });
});


$('form#login').submit(function(event) {
  data = {
    user: $('input#user').val(),
    password: $('input#password').val(),
  }
  var alert = $('div#alert_login');
  event.preventDefault();
  $.ajax({
    url: '/login',
    type: 'POST',
    contentType: 'application/json',
    dataType: 'JSON',
    data: JSON.stringify(data),
    beforeSend: function(){
                  alert.html('<br><div class="alert alert-warning text-center"><strong>Estamos Intentando Ingresar...</strong><img width="50" heigth="50" src="/img/loading.gif"></div>');
                  alert.fadeIn('400');
                }
  })
  .done(function(msg) {
    if (msg == 0) {
      alert.html('<br><div class="alert alert-danger text-center"><strong>Las Credenciales No Son Correctas</strong></div>');
    }
    if (msg == 2) {
      alert.html('<br><div class="alert alert-warning text-center"><strong>Verifique su correo, para activar su cuenta</strong></div>');
    }
    if (msg == 3) {
      alert.html('<br><div class="alert alert-warning text-center"><strong>Cuenta Restringida por Incumplimiento de Nuestros Terminos y Condiciones</strong></div>');
    }
    if (msg == 1) {
      location.href = 'https://192.168.43.162:3000/users';
    }
    if (msg == 4) {
      location.href = 'https://192.168.43.162:3000/admin';
    }
  })
  .fail(function() {
    alert.html('<br><div class="alert alert-danger text-center"><strong>No Se Puede Ingresar Ahora. Intente Más Tarde</strong></div>');
  });
});
