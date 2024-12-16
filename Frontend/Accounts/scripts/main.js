console.log("Script loaded");

const newButton = document.querySelector("button.button1");
const helpButton = document.querySelector("button.button2");

newButton.addEventListener("click", function () {
  window.open(
    "http://make-everything-ok.com/", "_blank");
});

helpButton.addEventListener("click", function () {
  alert("Help me");
});