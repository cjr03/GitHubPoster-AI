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

const obj = JSON.parse(text);
const repositories = obj.repositories; 
const btnGroup = document.querySelector('.btn-group');

btnGroup.innerHTML = '';
repositories.forEach(repo => {
  const button = document.createElement('button');
  button.textContent = repo.name; 
  button.addEventListener('click', function () {
    alert(repo.description);
  });
  btnGroup.appendChild(button);
});
