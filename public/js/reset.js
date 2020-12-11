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

function formValidate(e)
{
    var error = false;

    var text = nPassword.value;
    console.log(text.length);
    var regx = /[^A-Za-z0-9]/;
    if(!regx.test(text) || text.length < 6){
        document.getElementById('newPassword').innerHTML = "***password must be greater than 6 and include a special symbol";
        document.getElementById('newPassword').classList.add('error');
        document.forms["form"]['newPassword'].classList.add('red');
        error = true;
    }

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

form.onsubmit= formValidate;