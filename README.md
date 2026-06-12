# CRUD App with Gmail Authentication

A full stack CRUD application built with React, FastAPI and Firebase.

## Features
- Login with Google Gmail account
- Create, Read, Update and Delete persons
- Data stored in Firebase Firestore
- Protected API with Firebase Authentication

## Tech Stack
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Python, FastAPI
- Database: Firebase Firestore
- Authentication: Firebase Google Sign-In

## How to Run

### Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend
cd frontend
npm install --legacy-peer-deps
npm start

## API Endpoints
- POST /persons - Create a person
- GET /persons - Get all persons
- PUT /persons/{id} - Update a person
- DELETE /persons/{id} - Delete a person
