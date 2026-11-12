function tips(step){
  var labels = [];
  labels[1] = 'Cancelando bloqueio CSS';
  labels[2] = 'Cancelando bloqueio JS';
  labels[3] = 'Limpando bloqueio HTML';
  labels[4] = 'Limpando bloqueio jQuery';
  labels[5] = 'Ativando clique direito';
  labels[6] = 'Ativar Copiar';
  var divid = 'enable_copy_div_interactive_fics';
  var copydiv = document.getElementById(divid);
  if (!copydiv) {
    var div = document.createElement('div');
    var css = document.createElement('style');
    div.id = divid;
    div.title = 'Ativar Copiar';
    css.innerHTML = '#' + div.id + ' {opacity:0.88;width:220px;border:5px solid #d2d2d2;border-radius:10px;padding:20px;line-height:20px;background:#fff;color:#000;cursor:pointer;top:20px;right:50px;position:fixed;z-index:999999;}';
    document.body.appendChild(css);
    document.body.appendChild(div);
    copydiv = document.getElementById(divid);
    copydiv.innerHTML = labels[step];
  } else {
    if (step == 7) {
      copydiv.remove();
    } else {
      copydiv.innerHTML = labels[step];
    }
  }
}

function fun(step){
  return function(){
    tips(step);
  };
}

[1, 2, 3, 4, 5, 6, 7].forEach(step => {
  setTimeout(fun(step), (step - 1) * 500);
});
