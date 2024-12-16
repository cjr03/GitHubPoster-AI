from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.http import HttpResponseForbidden
from django.http import JsonResponse, HttpResponseRedirect
import random
import string
import requests
from django.conf import settings
from .models import Draft, UserToken
import openai
from .chatgpt_api import ChatGPTAPI
import os


@login_required
#renders home page
def home(request):
    return render(request, "home.html", {})

#uses Django's innate user class to sign up and log them in
def authView(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST or None)
        if form.is_valid():
            form.save()
            return redirect("automates_app:login")
    else:
        form = UserCreationForm()
    return render(request, "registration/signup.html", {"form": form})

#delete current user's account
def delete_account(request):
    if request.method == "POST":
        user = request.user

        logout(request)

        user.delete()

        return redirect("automates_app:home")
    else:
        return HttpResponseForbidden("Invalid request method")

#renders account page
def accounts(request):
    return render(request, "accounts.html")


#GitHubAPI class
class GitHubAPI():
    def authenticate(request):
        #function to authenticate user
        
        #client id and redirect url taken from settings
        client_id = settings.GITHUB_CLIENT_ID
        redirect_uri = settings.GITHUB_REDIRECT_URI
    
        #generates a random string of letters and numbers for security
        state = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
        
        #stores state for validation for each session
        request.session['github_state'] = state 
        request.session.save()
        
        #debugging
        #print(f"Generated state:{state}")
        
        github_auth_url = (
            #string literal to generate the url for authentication
            f"https://github.com/login/oauth/authorize?client_id={client_id}"
            f"&redirect_uri={redirect_uri}&state={state}"
        )
        
        return redirect(github_auth_url)
    
    #url passed in is https://api.github.com/users/USERNAME/repos
    def getUserRepos(auth_token):
        #defines headers for response
        headers = {
            'Accept': 'application/vnd.github+json',
            'Authorization': f'Bearer {auth_token}',
            'X-GitHub-Api-Version': '2022-11-28',
        }

        #retrieves response from api call
        response = requests.get('https://api.github.com/user/repos', headers=headers)

        #status code of 200 means response is good
        if response.status_code == 200:
            #retrieve repos
            repos = response.json()
            public_repos = []
            
            #fills public_repos with repo data
            for repo in repos:
                if not repo["private"]:
                    public_repos.append({
                        "name": repo["name"],
                        "html_url": repo["html_url"],
                        "description": repo.get("description"),
                        "language": repo.get("language"),
                    })
            return public_repos
        else:
            #Status code will ilkely be 400 if there is an error
            return {f"error: Failed to fetch repositories - Status Code: {response.status_code}"}
    
    #grabs code and state from callback to generate access token
    def generate_access_token(code, state, request):
        token_url = "https://github.com/login/oauth/access_token"
        #Set headers and data for response
        headers =  {
            'Accept': 'application/json'
        }
        data = {
        'client_id': settings.GITHUB_CLIENT_ID,
        'client_secret': settings.GITHUB_CLIENT_SECRET,
        'code': code,
        'redirect_uri': settings.GITHUB_REDIRECT_URI,
        }
        
        #Troubleshooting
        # print(f"Requesting access token with code: {code}")
        # print(f"Headers: {headers}")
        # print(f"Data: {data}")    
        
        response = requests.post(token_url, headers=headers, data=data)
        
        #Troubleshooting
        # print(f"Token exchange response status: {response.status_code}")
        # print(f"Token exchange response body: {response.text}")
        
        #Check for proper status code (200) and return token retrieved from JSON
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access_token')
            return {"access_token": access_token}
        else: #Error handling
            return {"error": "Failed to retrieve access token"}
        
    #returns usertoken
    def get_user_token(user):
        #try-except for errors
        try:
            user_token = UserToken.objects.get(user=user)
            return user_token.token
        except UserToken.DoesNotExist:
            return {"error": "Failed to retrieve user token"}
            
    #fetch readme content from user's repo
    def fetch_readme_content(owner, repo_name, branch):
        #(Stack Overflow utilized for url)
        url = f"https://raw.githubusercontent.com/{owner}/{repo_name}/{branch}/README.md"
        response = requests.get(url)
        
        print({"readme": response.text})
        
        #Returns readme on success
        if response.status_code == 200:
            return {"readme": response.text}
        #Returns error on fail
        elif response.status_code == 404:
            return {"error": "Readme not found"}
        else:
            return {"error": "Error fetching repository"}
        
    def get_username(auth_token):
        #uses auth token to grab username
        url = "https://api.github.com/user"
        headers = {
            "Authorization": f"Bearer {auth_token}",
            "Accept": "application/vnd.github+json",
        }
        
        #Encapsulates process in try-except for errors
        try:
            response = requests.get(url, headers=headers)
            #Response works (status=200)
            if response.status_code == 200:
                user_data = response.json()
                #returns Username
                return {"username": user_data.get("login")}
            #Response fails (likely status=400)
            else:
                return { #return status and json to check for possible errors
                    "error": f"Error retrieving username: {response.status_code}",
                    "details": response.json(),
                }
        except requests.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}
            
            
#GithubAPI views to create endpoints

#Authentication endpoint
def githubAuth(request):
    return GitHubAPI.authenticate(request)

#fetch user repos
def fetchUserRepos(request):
    #Grabs auth token
    auth_token = request.GET.get('token')
    #Error handling for status code 400
    if not auth_token:
        return JsonResponse({"error": "Authorization token is Incorrect"}, status=400)
    #Grab repos from class method designed above and return repos
    repos = GitHubAPI.get_user_repos(auth_token)
    return JsonResponse(repos, safe=False)

#callback after authentication
def github_callback(request):
    #Important data to generate user access token
    code = request.GET.get('code')
    state = request.GET.get('state')

    #Important security protocal (prevents CSRF attack by ensuring state cannot be pulled after authentication)
    session_state = request.session.pop('github_state', None)
    
    #Troubleshooting
    # print(f"Github state: {state}")
    # print(f"Session State: {session_state}")
    
    #State check
    if state != session_state:
        return JsonResponse({"error": "Invalid state"}, status=400)
    
    #Token exchange
    result = GitHubAPI.generate_access_token(code, state, request)
    
    #Error Handling
    if "error" in result:
        return JsonResponse(result, status=400)
    
    #
    access_token = result.get('access_token')
    user = request.user
    
    #Django ORM used to retrieve/create Usertoken for inputted user
    #created returns true if object was newly created or just retrieved from DB
    user_token, created = UserToken.objects.get_or_create(user=user)
    user_token.token = access_token
    user_token.save()
    redirect_url = f"{settings.FRONTEND_REDIRECT_URI}?token={access_token}"
    return HttpResponseRedirect(redirect_url)
    #View for grabbind readme from user repository
def fetch_readme_view(request, owner, repo_name):
    #Sets branch to main by default until functional
    branch = "main"
    result = GitHubAPI.fetch_readme_content(owner, repo_name, branch)
    
    #Error Handling
    if "error" in result:
        return JsonResponse(result, status=404)
    return JsonResponse(result, status=200)

#View to grab username (required for readme fetch)
def fetch_username(request):
    auth_token = request.GET.get("token")
    
    #Django functionality to ensure user is logged in
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=403)

    #Fetch token for the authenticated user
    token = GitHubAPI.get_user_token(request.user)
    if not token:
        return JsonResponse({"error": "No token found for the user"}, status=404)
    
    #set up response
    url = "https://api.github.com/user"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
    }
    response = requests.get(url, headers=headers)
    
    #Error handling for different status codes
    if response.status_code == 200:
        user_data = response.json()
        return JsonResponse({"username": user_data.get("login")}, status=200)
    elif response.status_code == 401:
        return JsonResponse({"error": "Invalid/expired token"}, status=401)
    else:
        return JsonResponse({"error": f"Failed to fetch username, status code: {response.status_code}"}, status=response.status_code)
        
@login_required
#saves the current's users work as a draft
def save_draft(request):
    if request.method == 'POST':
        draft_name = request.POST.get('name')
        description = request.POST.get('description')
        audience = request.POST.get('audience')
        style = request.POST.get('style')
        tone = request.POST.get('tone')
        hashtags = request.POST.get('hashtags')
        generated_description = request.POST.get('generated_description', '')

        if not draft_name or not description:
            return JsonResponse({'success': False, 'error': 'Name and description are required.'})

        try:
            draft, created = Draft.objects.update_or_create(
                name=draft_name,
                user=request.user, 
                defaults={
                    'description': description,
                    'audience': audience,
                    'style': style,
                    'tone': tone,
                    'hashtags': hashtags,
                    'generated_description': generated_description,
                }
            )
            return JsonResponse({'success': True, 'draft_id': draft.id})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required
#lists what drafts the current user has
def list_drafts(request):
    drafts = Draft.objects.filter(user=request.user).order_by("-created_at")
    drafts_data = drafts.values("id", "name")
    return JsonResponse({"drafts": list(drafts_data)})

@login_required
#loads the draft that a user clicks on as the current settings for a post
def load_draft(request, draft_id):
    try:
        draft = Draft.objects.get(id=draft_id)
        return JsonResponse({
            'success': True,
            'draft': {
                'name': draft.name,
                'description': draft.description,
                'audience': draft.audience,
                'style': draft.style,
                'tone': draft.tone,
                'hashtags': draft.hashtags,
                'generated_description': draft.generated_description
            }
        })
    except Draft.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Draft not found'})

#deletes the draft that a user is currently using/clicked on
def delete_draft(request, draft_id):
    try:
        draft = Draft.objects.get(id=draft_id, user=request.user) 
        draft.delete()  
        return JsonResponse({'success': True, 'message': 'Draft deleted successfully.'})
    except Draft.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Draft not found.'}, status=404)

#generates a gpt desciption based on what the user wants
def generate_description(request):
    if request.method == 'POST':
        description = request.POST.get('description')
        audience = request.POST.get('audience')
        style = request.POST.get('style')
        tone = request.POST.get('tone')
        hashtags = request.POST.get('hashtags')  
        
        chatgpt = ChatGPTAPI()
        
        generated_description = chatgpt.generateDescription(description, audience, style, tone, hashtags)
        
        return JsonResponse({'generated_description': generated_description})

    return JsonResponse({'error': 'Invalid request'}, status=400)
