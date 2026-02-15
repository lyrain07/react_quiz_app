# Math Quiz Game - Full Stack Application

A full-stack math quiz game built with React and Django, featuring user authentication, difficulty levels, guest mode, and real-time leaderboards.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![Django](https://img.shields.io/badge/Django-4.x-green)
![Status](https://img.shields.io/badge/status-production--ready-success)

---

## 📁 Project Structure

```
REACT_APP/
├── backend/                    # Django Backend
│   ├── quiz/                   # Main Django app
│   │   ├── models.py          # Database models
│   │   ├── views.py           # API endpoints
│   │   ├── urls.py            # URL routing
│   │   └── admin.py           # Admin panel config
│   ├── quiz_backend/          # Django settings
│   │   ├── settings.py
│   │   └── urls.py
│   ├── venv/                  # Python virtual environment
│   ├── db.sqlite3             # Database
│   └── manage.py
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── AuthScreen.jsx
│   │   ├── styles/
│   │   │   └── AuthScreen.css
│   │   │   └── App.css
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```
