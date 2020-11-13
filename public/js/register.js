var exampleInputName1 = document.getElementById('exampleInputName1');
var exampleInputEmail1 = document.getElementById('exampleInputEmail1');
var exampleInputPassword1 = document.getElementById('exampleInputPassword1');
var exampleInputCPassword1 = document.getElementById('exampleInputCPassword1');
var exampleInputEmail2 = document.getElementsByTagName('input');
var form = document.getElementById('form')

exampleInputName1.onkeypress = removeRedBorder(exampleInputName1);
exampleInputEmail1.onkeypress = removeRedBorder(exampleInputEmail1);
exampleInputPassword1.onkeypress = removeRedBorder(exampleInputPassword1);
exampleInputCPassword1.onkeypress = removeRedBorder(exampleInputCPassword1);

function removeRedBorder(id) {
    return function(){
        document.getElementById(id.id).className = 'form-control';
        document.getElementById(id.name).innerHTML = ""
    }
}

function validateForm(e) {
  var names = ['name', 'username', 'password', 'cpassword'];
  var error = false;
  names.forEach(function(el) {
    var val = document.forms["form"][el].value;
    if (val == null || val == "") {
      document.forms["form"][el].classList.add('red');
      if(el === 'cpassword'){
          document.getElementById(el).innerHTML = "***confirm password must be filled out";
      }else{
          document.getElementById(el).innerHTML = "***" + el + " must be filled out";
      }
      error = true;
    }
  });
    if(exampleInputPassword1.value !== exampleInputCPassword1.value)
    {
        document.getElementById('cpassword').innerHTML = "***password doesn't match";
        document.forms["form"]['cpassword'].classList.add('red');
        error = true;
    }
  if (error) return false;
}

form.onsubmit = validateForm;