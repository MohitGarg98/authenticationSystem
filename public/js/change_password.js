const cPassword = document.getElementById('cPassword');
const nPassword = document.getElementById('nPassword');
const cfPassword = document.getElementById('cfPassword');

cPassword.onkeypress = removeRedBorder(cPassword);
nPassword.onkeypress = removeRedBorder(nPassword);
cfPassword.onkeypress = removeRedBorder(cfPassword);

function removeRedBorder(id) {
    return function(){
        document.getElementById(id.id).className = 'form-control';
        document.getElementById(id.name).innerHTML = ""
    }
}

function formValidate(e)
{
  var error = false;
    var names = ['currentPassword', 'newPassword', 'confirmPassword'];
    names.forEach(function(el) {
    var val = document.forms["form"][el].value;
    if (val === null || val === "") {
      document.forms["form"][el].classList.add('red');
      document.getElementById(el).innerHTML = "***" + el + " must be filled out";
      error = true;
    }
  });

  if(nPassword.value !== cfPassword.value)
    {
        document.getElementById('confirmPassword').innerHTML = "***password doesn't match";
        document.forms["form"]['cfPassword'].classList.add('red');
        error = true;
    }

  if(error){return false;}
}

form.onsubmit= formValidate;