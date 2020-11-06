var exampleInputName1 = document.getElementById('exampleInputName1');
var exampleInputEmail1 = document.getElementById('exampleInputEmail1');
var exampleInputPassword1 = document.getElementById('exampleInputPassword1');
var exampleInputCPassword1 = document.getElementById('exampleInputCPassword1');
var exampleInputEmail2 = document.getElementsByTagName('input');
var regForm = document.getElementById('regForm')

console.log('hi');
console.log(exampleInputEmail2);
exampleInputName1.onkeypress = xyz(exampleInputName1);
exampleInputEmail1.onkeypress = xyz(exampleInputEmail1);
exampleInputPassword1.onkeypress = xyz(exampleInputPassword1);
exampleInputCPassword1.onkeypress = xyz(exampleInputCPassword1);
regForm.onsubmit = validateForm;

function xyz(id) {
    return function(){
        document.getElementById(id.id).className = 'form-control';
        // console.log(document.forms["reg-form"]['email']);
        document.getElementById(id.name).innerHTML = ""
    }
}

function validateForm(e) {
  var names = ['name', 'username', 'password', 'cpassword'];
  var error = false;
  names.forEach(function(el) {
    var val = document.forms["reg-form"][el].value;
    if (val == null || val == "") {
      document.forms["reg-form"][el].classList.add('green');
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
        document.forms["reg-form"]['cpassword'].classList.add('green');
        error = true;
    }
  if (error) return false;
}

