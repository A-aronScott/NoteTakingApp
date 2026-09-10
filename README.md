# Note Taking App

A full-stack note-taking application built with **Node.js, Express, MongoDB, and vanilla HTML/CSS/JavaScript**.

The application allows users to create accounts, securely log in, and manage their own personal notes. Notes support titles, content, tags, pinned status, and archived status. The REST API is protected with JWT authentication so users can only access and modify their own notes.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Personal note collections for each user
- Create, read, update, and delete notes
- Pin and archive notes
- Note tags
- Search and filtering in the frontend
- Server-side request validation
- Protected note routes
- MongoDB database with Mongoose
- Centralized error handling
- API health-check endpoint
- Automated API tests using Mocha, Chai, and Supertest
- Responsive frontend design

## Technologies Used

### Backend

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JSON Web Token (JWT)**
- **bcryptjs**
- **dotenv**
- **CORS**

### Frontend

- HTML5
- CSS3
- JavaScript

### Testing

- Mocha
- Chai
- Supertest

## Project Structure

```text
NoteTakingApp/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── noteController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── notFoundMiddleware.js
│   │
│   ├── models/
│   │   ├── Note.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── noteRoutes.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   └── noteService.js
│   │
│   ├── utils/
│   │   └── validators.js
│   │
│   ├── app.js
│   └── server.js
│
├── tests/
│   ├── auth.test.js
│   ├── health.test.js
│   └── notes.test.js
│
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

## Prerequisites

Before running the application, make sure you have:

- **Node.js** installed
- **npm** installed
- A running **MongoDB** database
  - Local MongoDB installation, or
  - A MongoDB Atlas cluster

## Installation

1. Clone or download the project.

2. Open a terminal in the project directory.

3. Install the dependencies:

```bash
npm install
```

4. Create a `.env` file in the project root.

The application requires the following environment variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/notetakingapp
JWT_SECRET=your_secure_jwt_secret
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

Example:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/notetakingapp
JWT_SECRET=replace_with_a_long_random_secret
```

> Do not commit your `.env` file or expose your JWT secret. The project already ignores environment files through `.gitignore`.

## Running the Application

### Production/start mode

```bash
npm start
```

### Development mode

```bash
npm run dev
```

The development script uses Nodemon to restart the server when files change.

Once the server is running, open:

```text
http://localhost:3000
```

The Express server serves the frontend from the `public` directory.

## Authentication

Authentication uses **JWT (JSON Web Tokens)**.

After a successful registration or login, the API returns a token in the response.

For protected endpoints, include the token in the HTTP `Authorization` header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The authentication middleware verifies the token before allowing access to the notes API.

### User isolation

Every note is associated with a specific user through the `user` field.

Protected note operations query notes using both:

```text
note ID + authenticated user ID
```

This prevents one authenticated user from reading, modifying, or deleting another user's notes.

## API Documentation

Base API URL:

```text
http://localhost:3000/api
```

### Health Check

#### `GET /api/health`

Checks whether the API is running.

Response:

```json
{
  "success": true,
  "message": "Notes API is running"
}
```

---

# Authentication Endpoints

## Register

### `POST /api/auth/register`

Creates a new user account.

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Successful response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "USER_ID",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "JWT_TOKEN"
  }
}
```

### Validation

Registration requires:

- A name
- A valid email address
- A password containing at least 6 characters

Possible validation response:

```json
{
  "success": false,
  "errors": {
    "password": "Password must be at least 6 characters"
  }
}
```

If the email is already registered:

```json
{
  "success": false,
  "message": "An account with that email already exists."
}
```

HTTP status:

```text
409 Conflict
```

---

## Login

### `POST /api/auth/login`

Authenticates an existing user.

Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Successful response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "USER_ID",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "JWT_TOKEN"
  }
}
```

Invalid credentials return:

```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

HTTP status:

```text
401 Unauthorized
```

---

# Notes Endpoints

All note endpoints require authentication.

Include:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Get All Notes

### `GET /api/notes`

Returns all notes belonging to the authenticated user.

Successful response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "NOTE_ID",
      "title": "My First Note",
      "content": "This is my note.",
      "user": "USER_ID",
      "tags": ["school", "important"],
      "isPinned": false,
      "isArchived": false,
      "createdAt": "DATE",
      "updatedAt": "DATE"
    }
  ]
}
```

Notes are ordered by pinned status and then by most recently updated.

---

## Get One Note

### `GET /api/notes/:id`

Returns a single note belonging to the authenticated user.

Example:

```text
GET /api/notes/NOTE_ID
```

Successful response:

```json
{
  "success": true,
  "data": {
    "_id": "NOTE_ID",
    "title": "My First Note",
    "content": "This is my note.",
    "user": "USER_ID",
    "tags": [],
    "isPinned": false,
    "isArchived": false
  }
}
```

If the note does not exist or does not belong to the authenticated user:

```json
{
  "success": false,
  "message": "Note not found."
}
```

HTTP status:

```text
404 Not Found
```

---

## Create a Note

### `POST /api/notes`

Creates a note for the currently authenticated user.

Request body:

```json
{
  "title": "Shopping List",
  "content": "Milk, bread, eggs",
  "tags": ["shopping"],
  "isPinned": false,
  "isArchived": false
}
```

Only the title is required.

Successful response:

```json
{
  "success": true,
  "data": {
    "_id": "NOTE_ID",
    "title": "Shopping List",
    "content": "Milk, bread, eggs",
    "user": "USER_ID",
    "tags": ["shopping"],
    "isPinned": false,
    "isArchived": false
  }
}
```

HTTP status:

```text
201 Created
```

### Validation

The server validates:

- Title must be provided
- Content must be a string when supplied
- Tags must be an array when supplied
- `isPinned` must be a boolean when supplied
- `isArchived` must be a boolean when supplied

Example:

```json
{
  "success": false,
  "message": "Note title is required."
}
```

---

## Update a Note

### `PUT /api/notes/:id`

Updates an existing note.

Request body:

```json
{
  "title": "Updated Title",
  "content": "Updated content.",
  "tags": ["updated"],
  "isPinned": true,
  "isArchived": false
}
```

The service only accepts the following note fields for updates:

```text
title
content
tags
isPinned
isArchived
```

Successful response:

```json
{
  "success": true,
  "data": {
    "_id": "NOTE_ID",
    "title": "Updated Title",
    "content": "Updated content.",
    "tags": ["updated"],
    "isPinned": true,
    "isArchived": false
  }
}
```

---

## Delete a Note

### `DELETE /api/notes/:id`

Deletes a note belonging to the authenticated user.

Successful response:

```json
{
  "success": true,
  "message": "Note deleted successfully."
}
```

If the note does not exist or belongs to another user:

```json
{
  "success": false,
  "message": "Note not found."
}
```

HTTP status:

```text
404 Not Found
```

## HTTP Status Codes

The API uses the following status codes:

| Status | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Resource successfully created |
| `400` | Invalid request or validation error |
| `401` | Authentication required or invalid token |
| `404` | Resource or route not found |
| `409` | Resource conflict, such as duplicate email |
| `500` | Internal server error |

## Data Models

### User

Users contain:

```text
name
email
password
createdAt
updatedAt
```

Passwords are hashed using bcrypt before being stored.

### Note

Notes contain:

```text
title
content
user
tags
isPinned
isArchived
createdAt
updatedAt
```

The `user` field references the MongoDB `User` document that owns the note.

A database index is also created for the user's notes and their update time to improve note retrieval.

## Frontend

The frontend is located in the `public` directory.

It provides:

- Login screen
- Registration screen
- Notes sidebar
- Note search
- All Notes view
- Pinned Notes view
- Archived Notes view
- Note editor
- Create note functionality
- Edit note functionality
- Delete note functionality
- Pin/unpin functionality
- Archive functionality
- User information and logout
- Responsive layouts for smaller screens

The frontend communicates with the Express REST API using HTTP requests and sends the JWT as a Bearer token for protected operations.

## Error Handling

The application includes centralized error handling through:

```text
src/middleware/errorMiddleware.js
```

Unhandled application errors are returned as JSON:

```json
{
  "success": false,
  "message": "Error message"
}
```

Unknown routes are handled by:

```text
src/middleware/notFoundMiddleware.js
```

Example:

```json
{
  "success": false,
  "message": "Route not found: GET /api/example"
}
```

## Testing

The project includes automated API tests using **Mocha, Chai, and Supertest**.

Run the test suite with:

```bash
npm test
```

The tests cover areas including:

- API health check
- User registration
- User login
- Invalid credentials
- Registration validation
- Duplicate accounts
- Note creation
- Retrieving notes
- Retrieving individual notes
- Updating notes
- Deleting notes
- Authentication requirements
- Invalid JWTs
- Invalid note IDs
- User-to-user note access protection

## Security Considerations

The application includes several security measures:

- Passwords are hashed with bcrypt
- Passwords are not returned in API user objects
- JWT authentication protects note endpoints
- JWTs expire after 7 days
- Users can only access notes associated with their own user ID
- Server-side validation is performed before creating users or notes
- Environment variables are excluded from version control

For a production deployment, additional measures such as HTTPS, rate limiting, security headers, stronger password policies, and additional input sanitization should be considered.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port used by the Express server | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/notetakingapp` |
| `JWT_SECRET` | Secret used to sign JWTs | `your_secure_secret` |

## Development

To work on the project locally:

```bash
npm install
npm run dev
```

After making changes, run:

```bash
npm test
```

before committing changes.

## Author

Developed as a Node.js/Express/MongoDB note-taking application project by Aaron Covington © 2026
