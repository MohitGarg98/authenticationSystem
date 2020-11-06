regForm.onsubmit= loginValidate;
function loginValidate(e)
{
  // e.preventDefault();
  var error = false;
    var names = ['username', 'password'];
    names.forEach(function(el) {
    var val = document.forms["reg-form"][el].value;
    if (val === null || val === "") {
      document.forms["reg-form"][el].classList.add('green');
      document.getElementById(el).innerHTML = "***" + el + " must be filled out";
      error = true;
    }
  });
  if(error){return false;}
}