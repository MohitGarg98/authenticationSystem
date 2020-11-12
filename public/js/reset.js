var nPassword = document.getElementById('nPassword');
var cfPassword = document.getElementById('cfPassword');

cfPassword.onkeypress = removeRedBorder(cfPassword);
nPassword.onkeypress = removeRedBorder(nPassword);

function removeRedBorder(id) {
    return function(){
        document.getElementById(id.id).className = 'form-control';
        document.getElementById(id.name).innerHTML = ""
    }
}


form.onsubmit= formValidate;

function formValidate(e)
{
    var error = false;
        var names = ['newPassword', 'confirmPassword'];
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
        document.forms["form"]['confirmPassword'].classList.add('red');
        error = true;
    }
    if(error){return false;}
}