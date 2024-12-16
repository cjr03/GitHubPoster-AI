document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded");

    //Get CSRF Token
    function getCSRFToken() {
      return document.querySelector("[name=csrfmiddlewaretoken]").value;
    }

    // Get form elements
    const saveButton = document.querySelector(".save-draft-button");
    const generateButton = document.querySelector(".generate-button");
    const deleteButton = document.querySelector(".delete-draft-button");
    const draftsContainer = document.querySelector(".draft-group");
    const generatedTextArea = document.getElementById("generated");
    const copyButton = document.getElementById("copyButton");

    let selectedDraftId = null;

    // Repository List
    const repositories = [
      { "name": "Automates", "date created": "1986-12-14", "description": "Text-generator for LinkedIn posts" },
      { "name": "Test repo", "date created": "1986-12-14", "description": "description100!" },
      { "name": "I can't believe it's not butter!", "date created": "1986-12-14", "description": "Friday" },
      { "name": "Super Computer Sim", "date created": "1986-12-14", "description": "holy mackeral" },
      { "name": "test repo 2", "date created": "1986-12-14", "description": "qwerty" }
    ];

    // Repository buttons container
    const btnGroup = document.querySelector(".btn-group"); 
    let activeRepository = null;

    // Set initial generated text
    function setInitialGeneratedText() {
        generatedTextArea.value = "This is the generated description"; 
    }

    // Generate repository buttons
    function generateRepositoryButtons() {
        if (btnGroup) {
            btnGroup.innerHTML = ''; 

            repositories.forEach(repo => {
                const button = document.createElement('button');
                button.textContent = repo.name; 

                // Add click event listener
                button.addEventListener('click', function () {
                    if (activeRepository) {
                        activeRepository.style.backgroundColor = ''; 
                    }
                    button.style.backgroundColor = "#2d343c"; 
                    activeRepository = button; 

                    console.log("Current repository:", repo.name);
                    generatedTextArea.value = `🚀 Repository: ${repo.name}`;
                });

                
                btnGroup.appendChild(button);
            });
        }
    }

    // Load repository buttons
    generateRepositoryButtons();

    function setInitialGeneratedText() {
        generatedTextArea.value = "This is the generated description"; 
    }

    // Generate Text functionality
    if (generateButton) {
        generateButton.addEventListener("click", function (event) {
            event.preventDefault();

            // Get the values from the form
            const description = document.getElementById("description").value;
            const audience = document.getElementById("audience").value;
            const style = document.getElementById("style").value;
            const tone = document.getElementById("tone").value;
            const hashtags = document.getElementById("hashtags").value;

            // Prepare the data to send to Django
            const data = {
                description: description,
                audience: audience,
                style: style,
                tone: tone,
                hashtags: hashtags,
                csrfmiddlewaretoken: document.querySelector("[name=csrfmiddlewaretoken]").value
            };

            // Send POST request to Django
            fetch("/generate_description/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.generated_description) {
                    document.getElementById("generated").value = data.generated_description;
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    // Copy Generated Text functionality
    if (copyButton) {
        copyButton.addEventListener("click", function () {
            generatedTextArea.select();
            document.execCommand("copy"); 
            
            alert("Generated text copied to clipboard!");
        });
    }

    // Set the initial "generated" text
    setInitialGeneratedText();

// Save Draft functionality
if (saveButton) {
    saveButton.addEventListener("click", function (event) {
        event.preventDefault(); 

        const draftName = prompt("Enter a name for your draft:");
        if (!draftName) return;

        const description = document.getElementById("description").value;
        const audience = document.getElementById("audience").value;
        const style = document.getElementById("style").value;
        const tone = document.getElementById("tone").value;
        const hashtags = document.getElementById("hashtags").value;
        const generatedDescription = document.getElementById("generated").value; 

        fetch("/save_draft/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-CSRFToken": getCSRFToken(),
            },
            body: new URLSearchParams({
                name: draftName,
                description: description,
                audience: audience,
                style: style,
                tone: tone,
                hashtags: hashtags,
                generated_description: generatedDescription,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Create a new draft button dynamically
                const draftButton = document.createElement("button");
                draftButton.textContent = draftName;
                draftButton.addEventListener("click", () => loadDraft(data.draft_id));
                draftsContainer.appendChild(draftButton);

                alert("Draft saved successfully!");
            } else {
                console.error("Error saving draft:", data.error);
                alert("Failed to save draft: " + data.error);
            }
        })
        .catch(error => console.error("Error:", error));
    });
}

// Load specific draft
function loadDraft(draftId) {
    selectedDraftId = draftId;

    fetch(`/load_draft/${draftId}/`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                const draft = data.draft;
                document.getElementById("description").value = draft.description;
                document.getElementById("audience").value = draft.audience;
                document.getElementById("style").value = draft.style;
                document.getElementById("tone").value = draft.tone;
                document.getElementById("hashtags").value = draft.hashtags;
                document.getElementById("generated").value = draft.generated_description;
            } else {
                alert("Failed to load draft.");
            }
        });
}

// Initial load drafts
function loadDrafts() {
    fetch("/list_drafts/")
        .then((response) => response.json())
        .then((data) => {
            draftsContainer.innerHTML = "";
            if (data.drafts) {
                data.drafts.forEach((draft) => {
                    const button = document.createElement("button");
                    button.textContent = draft.name;
                    button.addEventListener("click", () => loadDraft(draft.id));
                    draftsContainer.appendChild(button);
                });
            }
        });
}

    // Delete Draft functionality
    if (deleteButton) {
        deleteButton.addEventListener("click", function () {
          if (!selectedDraftId) {
            alert("No draft selected to delete.");
            return;
          }
    
          if (confirm("Are you sure you want to delete this draft?")) {
            fetch(`/delete_draft/${selectedDraftId}/`, {
              method: "DELETE",
              headers: {
                "X-CSRFToken": getCSRFToken(),
              },
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  alert("Draft deleted successfully!");
                  loadDrafts();
                } else {
                  alert("Failed to delete draft.");
                }
              });
          }
        });
    }

    let tempUsername = "";
    //fetch and store username
    async function fetchUsername() {
        try {
            const response = await fetch('/fetch_username/');
            if (!response.ok) {
                throw new Error(`Error fetching username: ${response.status}`);
            }
    
            const data = await response.json();
            if (data.username) {
                console.log(`GitHub Username: ${data.username}`);
                //Store as global var
                tempUsername = data.username;
    
                //User username to fetch repositories
                fetchRepositories(tempUsername);
            } else {
                console.error("Failed to fetch username");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    //
    async function fetchRepositories(username) {
        if (!username) {
            console.error("Username is not defined");
            return;
        }
        
        try {
            const response = await fetch(`/fetch_repositories/${username}/`);
            if (!response.ok) {
                throw new Error(`Error fetching repositories: ${response.status}`);
            }
    
            const repositories = await response.json();
            console.log("Fetched Repositories:", repositories);
    
            //Display Repos
            const btnGroup = document.getElementById('.btn-group');
            if (btnGroup) {
                //clear previous buttons
                btnGroup.innerHTML = '';
    
                repositories.forEach(repo => {
                    //Button for each repo
                    const button = document.createElement('button');

                    //Style
                    button.classList.add('button', 'repo-button');
                    //button text to repository name
                    button.textContent = repo.name;

                    button.addEventListener('click', () => {
                        alert(`Repository Name: ${repo.name}\nURL: ${repo.html_url}`);
                        //Additional functionality to be added here 
                    });
                    btnGroup.appendChild(button);
                });
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    //grabs github username
    fetchUsername();
        
    //Uses username to get repositories
    fetchRepositories(username);


    // Set the initial "generated" text
    setInitialGeneratedText();

    // Initial load drafts
    loadDrafts();
});


