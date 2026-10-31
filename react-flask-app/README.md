# React-Flask Dockerized App

A simple full-stack web application with a React frontend and a Flask backend. The frontend fetches data from the backend using RESTful API calls. The application is fully containerized using Docker, making it easy to set up and deploy.

---

## Features

- **React Frontend**: Displays a list of members fetched from the Flask API.
- **Flask Backend**: Provides a simple API endpoint (`/members`) returning a JSON object.
- **Dockerized Setup**: Both the frontend and backend run in separate Docker containers.
- **Cross-Origin Support**: Enabled via Flask-CORS for seamless communication between frontend and backend.
- **Production Ready**: Nginx serves the React static files, and the backend is scalable.



## Project Structure


```plaintext
. ├── client # React frontend
  | ├── public # Static files (e.g., index.html, favicon)
  │ ├── src # React source files
  │ ├── package.json # React dependencies and scripts 
  ├── flask-server # Flask backend 
  │ ├── server.py # Flask server code 
  │ ├── requirements.txt # Python dependencies 
  ├── docker-compose.yml # Docker Compose configuration
```


## Prerequisites

- **Node.js**: For running the React development server locally.
- **Python 3.10+**: For the Flask backend.
- **Docker & Docker Compose**: For containerizing the application.



## Getting Started

### Clone the Repository

```bash
git clone https://github.com/diarmuidbrady/react-flask-app.git
cd react-flask-docker-app
```

### Run the Application
Build and Start Containers:

```bash
docker-compose up --build
```

### Access the Application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/members