$('li#profile').addClass('active');
var image = $('input#file2');
var flag = false;

$('button#file1').click(function(event) {
  event.preventDefault();
  image.click();
});

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

var change_password = function(pass){
  console.log(pass.value);
  if (pass.value == '') {
    flag = false;
    $('input#ps1').prop('required',false);
    $('input#ps2').prop('disabled',true);
    $('input#ps2').prop('value','');
  }else {
    flag = true;
    $('input#ps1').prop('required',true);
    $('input#ps2').prop('disabled',false);
  }
}

image.change(function(){
 var input = this;
 dato = new FormData($('form#form_photo')[0]);

 if (input.files && input.files[0]) {
  var reader = new FileReader();
    reader.onload = function (e) {
      $('img#photoEdit').attr('src', e.target.result);
      src = e.target.result;
    }
    reader.readAsDataURL(input.files[0]);
  $.ajax({
    url: 'https://192.168.43.162:3000/users/changeImage/',
    type: 'POST',
    dataType: 'JSON',
    data: dato,
    cache: false,
    contentType:false,
    processData: false
  })
  .done(function(msg) {
    if (msg == 1) {
      window.location.reload();
    }else {
      alert('ocurrio un error');
      // window.location.href = '/publicitate/home/message';
      // console.log(msg);
    }
  })
  .fail(function() {
    alert('ocurrio un error');
    // window.location.href = '/publicitate/home/message';
  });
 }
});

$('button#delphoto').click(function(event) {
  $.ajax({
    url: 'https://192.168.43.162:3000/users/deleteImage/',
    type: 'DELETE',
    dataType: 'JSON'
  })
  .done(function(msg) {
    if (msg == 1) {
      window.location.reload();
    }else {
      alert('Error');
      // window.location.href = '/publicitate/home/message';
      // console.log(msg);
    }
  })
  .fail(function() {
    alert('Error');
  });

});

$('form#update').submit(function(event) {
  var alert = $('div#alert_update');
  if (!flag) {
    data = {
      firstName: $('input#firstName').val(),
      lastName: $('input#lastName').val(),
    }
  }else {
    data = {
      firstName: $('input#firstName').val(),
      lastName: $('input#lastName').val(),
      firstPassword: $('input#ps1').val(),
      secondPassword: $('input#ps2').val()
    }
  }
  event.preventDefault();
  $.ajax({
    url: $(this).attr('action'),
    type: 'PUT',
    contentType: 'application/json',
    dataType: 'JSON',
    data: JSON.stringify(data),
    beforeSend: function(){
                  alert.html('<br><div class="alert alert-warning text-center"><strong>Estamos Actualizando su Información...</strong><img width="50" heigth="50" src="https://192.168.43.162:3000/img/loading.gif"></div>');
                  alert.fadeIn('400');
                }
  })
  .done(function(msg) {
    if (msg == 0) {
      alert.html('<br><div class="alert alert-danger text-center"><strong>Las Contraseñas deben ser Iguales</strong></div>');
    }
    if (msg == 1) {
      alert.html('<br><div class="alert alert-success text-center"><strong>Actulizado Exitosamente</div>');
      setTimeout(function() {
        alert.fadeOut('slow');
        location.reload();
      }, 3500);
    }
  })
  .fail(function() {
    alert.html('<br><div class="alert alert-danger text-center"><strong>Ha Ocurrido Un Error. Intente Más Tarde</strong></div>');
  });
});
