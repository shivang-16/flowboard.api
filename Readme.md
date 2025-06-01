# FLowboard Backend

Flowboard Backend is a robust Node.js application built with Express and Mongoose, serving as the API for a task and project management system. It handles user authentication, project creation and management, task assignments, and analytics.

## Features

- User Authentication (Email/Password, Google OAuth)
- Project Management (Create, Read, Update, Delete projects)
- Task Management (Create, Read, Update, Delete tasks, assign to users)
- Project Analytics (Track total, completed, in-progress, and overdue tasks)
- User Management (List users, assign to projects/tasks)
- Secure password handling with bcrypt

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB (via Mongoose)
- JWT for authentication
- bcryptjs for password hashing
- cookie-parser
- cors
- axios

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance (local or cloud-based)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/shivang-16/flowboard.api.git
    cd flowboard.api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

3.  **Create a `.env` file in the root directory** and add the following environment variables:

    ```
    PORT=5000
    MONGO_URI=<Your MongoDB Connection String>
    JWT_SECRET=<A strong secret key for JWT>
    JWT_COOKIE_EXPIRE=7d
    FRONTEND_URL=<Your Frontend URL>
    GOOGLE_CLIENT_ID=<Your Google OAuth Client ID>
    GOOGLE_CLIENT_SECRET=<Your Google OAuth Client Secret>
    ```

4.  **Build the TypeScript code:**
    ```bash
    npm run build
    ```

5.  **Start the server:**
    ```bash
    npm start
    ```

    The server will run on the port specified in your `.env` file (default: 5000).

## API Endpoints

Base URL: `http://localhost:4000/api` (or your deployed backend URL)

### Authentication

-   `POST /api/auth/register` - Register a new user
-   `POST /api/auth/login` - Log in a user
-   `GET /api/auth/logout` - Log out a user
-   `GET /api/auth/me` - Get current user's profile
-   `POST /api/google/auth` - Google OAuth authentication

### Projects

-   `POST /api/project/create` - Create a new project
-   `GET /api/project/all` - Get all projects for the authenticated user
-   `GET /api/project/:id` - Get a project by ID
-   `PUT /api/project/:id` - Update a project by ID
-   `DELETE /api/project/:id` - Delete a project by ID

### Tasks

-   `POST /api/task/create` - Create a new task
-   `GET /api/task/all` - Get all tasks
-   `GET /api/task/:id` - Get a task by ID
-   `PUT /api/task/:id` - Update a task by ID
-   `DELETE /api/task/:id` - Delete a task by ID
-   `GET /api/task/project/:projectId` - Get tasks by project ID

### Users

-   `GET /api/user/all` - Get all users
-   `GET /api/user/project/:projectId` - Get users associated with a project
-   `POST /api/user/assign-project` - Assign a user to a project
-   `POST /api/user/assign-task` - Assign a user to a task

## Error Handling

Custom error handling middleware is implemented to provide consistent error responses.

## Contributing

Feel free to fork the repository and contribute. Please open an issue first to discuss your proposed changes.

## License

This project is licensed under the MIT License.