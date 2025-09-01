console.log("Script loaded");

const newButton = document.querySelector("button.button1");
const accountButton = document.querySelector("button.login");
const helpButton = document.querySelector("button.button2");

newButton.addEventListener("click", function () {
  window.open(
    "../Text-Gen/index.html", "_blank");
});

accountButton.addEventListener("click", function () {
  window.open(
    "../Accounts/index.html", "_self");
});

helpButton.addEventListener("click", function () {
  alert("Help me");
});
