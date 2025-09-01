console.log("Script loaded");

const newButton = document.querySelector("button.button1");
const SignInButton = document.querySelector("button.login1");
const SingOutButton = document.querySelector("button.login2");
const helpButton = document.querySelector("button.button2");

newButton.addEventListener("click", function () {
  window.open(
    "../Text-Gen/index.html", "_blank");
});

SignInButton.addEventListener("click", function () {
  window.open(
    "../Sign-In/index.html", "_self");
});

SingOutButton.addEventListener("click", function () {
  window.open(
    "../Sign-Out/index.html", "_self");
});

helpButton.addEventListener("click", function () {
  alert("Help me");
});
