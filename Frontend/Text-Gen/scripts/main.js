console.log("Script loaded");

const newButton = document.querySelector("button.button1");
const accountButton = document.querySelector("button.login");
const helpButton = document.querySelector("button.button2");

accountButton.addEventListener("click", function () {
  window.open(
    "../Accounts/index.html", "_blank");
});

/*
helpButton.addEventListener("click", function () {
  alert("Help me");
});
*/

const audienceDrop = document.getElementById("audience");
var audience;
var audienceOther = document.getElementById("audienceTextBox");
const styleDrop = document.getElementById("style");
var style;
var audienceOther = document.getElementById("styleTextBox");
const toneDrop = document.getElementById("tone");
var tone;
var toneOther = document.getElementById("toneTextBox");

function handleAudienceChange() {
  audience = audienceDrop.options[audienceDrop.selectedIndex].text;
  console.log("Selected audience:", audience);
  
  if (audience === "Other") {
    console.log("Display");
    audienceTextBox.style.display = "block";
  } else {
    console.log("Hide");
    audienceTextBox.style.display = "none";
  }
}

function handleStyleChange() {
  style = styleDrop.options[styleDrop.selectedIndex].text;
  console.log("Selected style:", style);
  
  if (style === "Other") {
    console.log("Display");
    styleTextBox.style.display = "block";
  } else {
    console.log("Hide");
    styleTextBox.style.display = "none";
  }
}

function handleToneChange() {
  tone = toneDrop.options[toneDrop.selectedIndex].text;
  console.log("Selected tone:", tone);
  
  if (tone === "Other") {
    console.log("Display");
    toneTextBox.style.display = "block";
  } else {
    console.log("Hide");
    toneTextBox.style.display = "none";
  }
}

var text = `{
  "repositories": [
    {"name": "Automates", "date created": "1986-12-14", "description": "Text-generator for LinkedIn posts"},
    {"name": "Test repo", "date created": "1986-12-14", "description": "description100!"},
    {"name": "I can't believe it's not butter!", "date created": "1986-12-14", "description": "Friday"},
    {"name": "Super Computer Sim", "date created": "1986-12-14", "description": "holy mackeral"},
    {"name": "test repo 2", "date created": "1986-12-14", "description": "qwerty"}
  ]
}`;

// Parse the JSON text
const obj = JSON.parse(text);
const repositories = obj.repositories; // Extract the repositories array

// Select the button group container
const btnGroup = document.querySelector('.btn-group');

// Remove any existing button(s) to start fresh
btnGroup.innerHTML = '';

let activeButton = null; // Variable to track the currently active button

var repository;
// Create and append a button for each repository
repositories.forEach(repo => {
  const button = document.createElement('button');
  button.textContent = repo.name; // Set button name

  // Add click event listener to show the description in an alert
  button.addEventListener('click', function () {
    // Reset color of the previously active button
    if (activeButton) {
      activeButton.style.backgroundColor = ''; // Reset to default color
    }

    // Highlight the currently clicked button
    button.style.backgroundColor = "#2d343c";
    activeButton = button; // Update the active button reference
    repository = repo;
    console.log("Current repository: ", repository.name);
    // Show repository description
    alert(repo.description);
  });

  // Append the button to the button group
  btnGroup.appendChild(button);
});

// Check the initial selection on page load
handleAudienceChange();
handleStyleChange();
handleToneChange();

// Add event listener to handle dropdown changes
audienceDrop.addEventListener("change", handleAudienceChange);
styleDrop.addEventListener("change", handleStyleChange);
toneDrop.addEventListener("change", handleToneChange);

async function generateDescription(data) {
    const apiUrl = '../../backend/urls/generate-description/';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Django expects form data
            },
            body: new URLSearchParams(data), // Convert the data object to URL-encoded string
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Generated Description:', result.description);
            document.getElementById('descriptionOutput').textContent = result.description; // Display result
        } else {
            console.error('Error generating description:', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

generateButton.addEventListener("click", function () {
  settings = [];
  description = document.getElementById("description").value;
  hashtags = document.getElementById("hashtags").value;
  var a = audience;
  var s  = style;
  var t = tone;
  if(audience === "Other"){
    a = audienceOther;
  }
  if(style === "Other"){
    s = styleOther;
  }
  if(tone === "Other"){
    t = toneOther;
  }
  const formData = {
    repoLink: repository,
    userDescription: description,
    audience: a,
    tone: t,
    style: s,
    hashtags: hashtags,
  };
  settings.push(description, a, s, t, hashtags);
  generateDescription(formData);
  console.log(settings);
});
