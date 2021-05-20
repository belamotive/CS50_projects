let showPasswordBtn = document.querySelector("#showpassword");
let passwordInput = document.querySelector("#password");

showPasswordBtn.addEventListener("click", function (e) {
  // toggle the type attribute
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
});

(function () {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

const accounteditBtn = document.querySelector("#accounteditbtn");
const accountinfo = document.querySelector("#accountinfo");
const accountupdate = document.querySelector("#accountupdate");

accounteditBtn.addEventListener("click", function () {
  accountinfo.style.display = "none";
  passwordinfo.style.display = "none";
  accountupdate.style.display = "block";
  console.log("togle");
});

const passwordeditBtn = document.querySelector("#passwordeditbtn");
const passwordinfo = document.querySelector("#passwordinfo");
const passwordupdate = document.querySelector("#passwordupdate");

passwordeditBtn.addEventListener("click", function () {
  passwordinfo.style.display = "none";
  accountinfo.style.display = "none";
  passwordupdate.style.display = "block";
  console.log("togle");
});
