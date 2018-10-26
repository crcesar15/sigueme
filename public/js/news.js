$('li#news').addClass('active');

var deleteNew = function(id,node){
    $.ajax({
      url: 'https://192.168.43.162:3000/users/news/'+id+'/'+node,
      type: 'DELETE'
    })
    .done(function(msg) {
      if (msg == 1) {
        location.reload();
        console.log('salio');
      }else {
        console.log(':(');
      }
    })
    .fail(function() {
      console.log("error");
    })

}
