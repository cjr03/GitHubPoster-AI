console.log("Script loaded");

const submitButton = document.querySelector("button.submit");

submitButton.addEventListener("click", function () {
  window.open(
    "../Text-Gen/index.html", "_blank");
});
