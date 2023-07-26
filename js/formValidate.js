var submitted = false;

function validateName() {
    var name = document.getElementById('name').value;
    if (!name.match(/^[a-zA-Z]{3,}(?: [a-zA-Z]+){0,2}$/)) {
      alert("Please enter your correct name") ;//Validation Message
      return false;
    }
    return true;
  }

function validateEmail () {

  var email = document.getElementById('email').value;
  if(!email.match(/^[A-Za-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)) {
    alert("Please enter a correct email address") ;//Validation Message
    return false;
  }

  return true;

}

function resetForm() {
  document.getElementById('contact-form').reset();
  console.log('Reset');
}

function validateForm() {
  if (!validateName() || !validateEmail()) {
    return false;
  }

  else {
    submitted = true;
    var thankyou = '<div class="col-md-12" id="success" style="color: green;"><br><div>Your message was sent successfully. Thanks!</div></div>';
    $("#my-form .row").append(thankyou);
    return true;
  }
}


