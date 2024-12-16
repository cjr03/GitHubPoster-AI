console.log("Script loaded");

var text = `{
  "repositories": [
    {"name": "Ballistic missile", "date created": "1986-12-14", "description": "Fun for the whole family!"},
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

// Create and append a button for each repository
repositories.forEach(repo => {
  const button = document.createElement('button');
  button.textContent = repo.name; // Set button name

  // Add click event listener to show the description in an alert
  button.addEventListener('click', function () {
    alert(repo.description);
  });

  // Append the button to the button group
  btnGroup.appendChild(button);
});
