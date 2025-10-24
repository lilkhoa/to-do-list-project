# To-Do List Project

A comprehensive, modern web-based to-do list application built with Node.js and Express. This project features user authentication, task management with categories, soft delete functionality, and bulk operations.

## Features

### Core Functionality
- **Task Management**: Create, read, update, and delete tasks
- **Due Date & Time**: Set specific deadlines for tasks
- **Rich Descriptions**: Add detailed descriptions to tasks
- **Smart Categories**: Automatic categorization (Overdue, Pending, Completed)

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js v5.1.0** - Web framework
- **MySQL2 v3.14.2** - Database driver
- **Handlebars v4.7.8** - Template engine
- **bcrypt v6.0.0** - Password hashing
- **express-session v1.18.2** - Session management
- **method-override v3.0.0** - RESTful HTTP methods

### Frontend
- **Bootstrap 5** - CSS framework
- **SCSS/Sass v1.89.2** - CSS preprocessor
- **SweetAlert2** - Modern alerts
- **Bootstrap Icons** - Icon library
- **Vanilla JavaScript** - Client-side functionality

### Development Tools
- **Nodemon v3.1.10** - Development server
- **dotenv v17.2.1** - Environment variables
- **Multer v2.0.2** - File upload handling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/lilkhoa/to-do-list-project.git
   cd to-do-list-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Setup your environment**

   Create a `.env` file in the root directory and add the following configuration:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=task_manager
   SESSION_SECRET=your_session_secret_key
   PORT=3000
   ```

4. **Database Setup**
   ```sql
   CREATE DATABASE task_manager;
   USE task_manager;

   CREATE TABLE users (
       id INT PRIMARY KEY AUTO_INCREMENT,
       username VARCHAR(50) UNIQUE NOT NULL,
       avatar VARCHAR(255),
       password VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   
   CREATE TABLE tasks (
       id INT PRIMARY KEY AUTO_INCREMENT,
       title VARCHAR(255) NOT NULL,
       description TEXT,
       completed BOOLEAN DEFAULT FALSE,
       overdue BOOLEAN DEFAULT FALSE,
       due_datetime DATETIME,
       deleted_at TIMESTAMP NULL,
       user_id INT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );
   ```

5. **Compile SCSS (Optional)**
   ```bash
   npm run watch
   ```

6. **Start the application**
   ```bash
   npm start
   ```

7. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Usage

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Create your first task** using the "Add Task" button
3. **Set due dates and times** to stay organized
4. **Mark tasks as complete** when finished

### Managing Tasks
- **View by Category**: Tasks are automatically organized into Overdue, Pending, and Completed sections
- **Edit Tasks**: Click on any task to view details and make changes
- **Bulk Operations**: Select multiple tasks to complete, delete, or mark as incomplete
- **Trash Management**: Deleted tasks go to trash and can be restored 

### User Profile
- **Update Profile**: Change your avatar
- **Change Password**: Secure password updates
- **View Statistics**: Track your task completion progress

## Project Structure
```
to-do-list-project/
├── src/
│   ├── app/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   └── schedulers/    # Cron jobs
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── public/          # Static assets
│   │   ├── css/         # Compiled stylesheets
│   │   └── img/         # Images
│   ├── resources/       # Views and styles
│   │   ├── scss/        # SCSS source files
│   │   └── views/       # Handlebars templates
│   ├── routes/          # Route definitions
│   ├── utils/           # Utility functions
│   └── index.js         # Application entry point
├── package.json
└── README.md
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Demo video
You can watch the demo video of the project here: [Demo Video](https://www.youtube.com/watch?v=_ifhm1jCh30)

**Made by [lilkhoa](https://github.com/lilkhoa)**
