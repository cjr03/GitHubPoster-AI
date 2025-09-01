# Automates — GitHub to Post Generator
![Django](https://img.shields.io/badge/Django-green)
![JavaScript](https://img.shields.io/badge/JavaScript-yellow)
![HTML](https://img.shields.io/badge/HTML-orange)
![CSS](https://img.shields.io/badge/CSS-blue)
![OpenAI API](https://img.shields.io/badge/OpenAI_API-green)
![GitHub API](https://img.shields.io/badge/GitHub_API-purple)
![MySQL](https://img.shields.io/badge/SQLite-lightblue)

---

## Table of Contents

- [Overview](#Overview)
- [Features, Screenshots, & GIFS](#Features-Screenshots--GIFS)
- [Repository Structure](#Repository-Structure)
- [Demo Workflow](#Demo-Workflow)
- [Technologies](#Technologies)

---

## Overview

Automates is a web application that helps developers turn their GitHub projects into professional posts effortlessly. By linking GitHub accounts and selecting post preferences, users can generate AI-powered content tailored for specific audiences — such as hiring managers, investors, or peers. This application was developed as part of a senior design group project. It is in its MVP form and as such all functionality is not fully implemented.

**Try it here**: https://cjr03.github.io/GitHubPoster-AI/Frontend/Homepage/index.html

**Note**: This is a GitHub pages deployment of static HTML/CSS/JS files. Backend Django server is not running so API calls to OpenAI and GitHub will not work and data is instead mocked. Deployment serves to showcase frontend design and app flow.

**Key highlights:**
- Seamless GitHub repository and OpenAI integration
- Customizable post style, tone, and audience
- Copy-ready posts to save time and effort

**Goal**: Minimize post-generation time while providing professional-quality content.

---

## Features, Screenshots, & GIFS

1. **Customizable Parameters**
- Users can add an optional description
- Style: Professional, Academic, Casual, or Other
- Audience: Employers, Classmates, Coworkers, or Other
- Tone: Formal, Friendly, Casual, or Other
- Users can review and edit generated posts

<img src="/docs/param.png" width="800px">

2. **Text Generation**
- Input from GitHub projects and user preference
- Submit to AI for automatic post creation
- Faster than manually writing a post

<img src="/docs/text_gen.gif" width="800px">

3. **User Accounts**
- Login, Logout, Sign Up, and Account management supported
- Authenticated and stored in SQLite database

| Login Screen | Sign Up Screen | Account Management |
|--------------|----------------|--------------------|
| <img src="/docs/signin.png" width="300px"> | <img src="/docs/signup.png" width="300px"> | <img src="/docs/acctmgmt.png" width="300px"> |

### Home Page
<img src="/docs/home.png" width="600px">

---

## Repository Structure

### Backend
```plaintext
backend/
├── automates/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── automates_app/
    ├── chatgpt_api.py       # AI text generation
    ├── models.py            # Database models
    ├── views.py             # Request handlers
    ├── urls.py              # App routing
    ├── static/              # Backend static files
    ├── templates/           # Optional templates
    └── migrations/
```
- Handles GitHub and OpenAI integration
- AI text generation logic in chatgpt_api.py
- Modular URL routing and request handling
  
### Frontend
```plaintext
Frontend/
├── Homepage/
├── Sign-Up/
├── Sign-In/
├── Accounts/
└── RepositoryList/
```
- Each folder has index.html, scripts/main.js, styles/styles.css
- Modular JS/CSS for maintainability

---

## Demo Workflow

1. **Sign Up / Sign In**
2. **Connect GitHub Account**
3. **Generate Post**
- Select project
- Choose style, tone, audience, and optional description
- Submit and review AI-generated post
- Copy post

---

## Technologies

- **Backend**: Python, Django, SQLite
- **Frontend**: HTML, CSS, JavaScript
- **APIs**: GitHub API, OpenAI API
