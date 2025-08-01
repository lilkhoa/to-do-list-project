require('dotenv').config();
const express = require('express')
const path = require('path')
const route = require('./routes');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const { connectDB } = require('./config/database');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { env } = require('process');

const app = express()
const port = 3000

// Connect to MySQL database
connectDB()
  .then(() => console.log('MySQL Database connected successfully'))
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure Handlebars as view engine
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  helpers: {
    formatDate: function (datetime) {
      if (!datetime) return 'No date';
      const date = new Date(datetime);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    },

    formatTime: function (datetime) {
      if (!datetime) return '';
      const date = new Date(datetime);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    },

    truncate: function (str, length) {
      if (!str) return '';
      if (str.length <= length) return str;
      return str.substring(0, length) + '...';
    },

    isOverdue: function (datetime) {
      if (!datetime) return false;
      const now = new Date();
      const due = new Date(datetime);
      return due < now;
    },

    getTaskStatusClass: function (task) {
      if (task.completed) return 'completed';
      if (task.due_datetime && new Date(task.due_datetime) < new Date()) return 'overdue';
      return 'pending';
    },
    
    // Helper to check if there are overdue tasks
    hasOverdueTasks: function(tasks) {
      return tasks.some(task => !task.completed && new Date(task.due_datetime) < new Date());
    },
    
    // Helper to check if there are pending tasks
    hasPendingTasks: function(tasks) {
      return tasks.some(task => !task.completed && (!task.due_datetime || new Date(task.due_datetime) >= new Date()));
    },
    
    // Helper to check if there are completed tasks
    hasCompletedTasks: function(tasks) {
      return tasks.some(task => task.completed);
    },
    
    // Helper to count overdue tasks
    countOverdueTasks: function(tasks) {
      return tasks.filter(task => !task.completed && new Date(task.due_datetime) < new Date()).length;
    },
    
    // Helper to count pending tasks
    countPendingTasks: function(tasks) {
      return tasks.filter(task => !task.completed && (!task.due_datetime || new Date(task.due_datetime) >= new Date())).length;
    },
    
    // Helper to count completed tasks
    countCompletedTasks: function(tasks) {
      return tasks.filter(task => task.completed).length;
    },
    
    // Helper for logical AND operations
    and: function(a, b) {
      return a && b;
    },
    
    // Helper for logical NOT operations
    not: function(a) {
      return !a;
    },
    
    // Format full date and time
    formatDateTime: function (datetime) {
      if (!datetime) return 'Not available';
      const date = new Date(datetime);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    },
    
    // Get overdue duration
    getOverdueDuration: function (datetime) {
      if (!datetime) return '';
      const now = new Date();
      const due = new Date(datetime);
      const diff = now - due;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return 'Less than an hour';
      }
    },
    
    // Format date for HTML date input (YYYY-MM-DD)
    formatDateForInput: function (datetime) {
      if (!datetime) return '';
      const date = new Date(datetime);
      return date.toISOString().split('T')[0];
    },
    
    // Format time for HTML time input (HH:MM)
    formatTimeForInput: function (datetime) {
      if (!datetime) return '';
      const date = new Date(datetime);
      return date.toTimeString().slice(0, 5);
    },
    
    // Check if task is near overdue (within 24 hours)
    isNearOverdue: function (datetime) {
        if (!datetime) return false;
        const now = new Date();
        const due = new Date(datetime);
        const timeDiff = due - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // Task is near overdue if it's due within 24 hours but not yet overdue
        return hoursDiff > 0 && hoursDiff <= 24;
    },
    
    // Check if there are tasks near overdue
    hasNearOverdueTasks: function(tasks) {
        if (!tasks || !Array.isArray(tasks)) return false;
        return tasks.some(task => {
            if (!task.due_datetime || task.completed) return false;
            
            const now = new Date();
            const due = new Date(task.due_datetime);
            const timeDiff = due - now;
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            // Task is near overdue if it's due within 24 hours but not yet overdue
            return hoursDiff > 0 && hoursDiff <= 24;
        });
    },
    
    // Count tasks near overdue
    countNearOverdueTasks: function(tasks) {
        if (!tasks || !Array.isArray(tasks)) return 0;
        return tasks.filter(task => {
            if (!task.due_datetime || task.completed) return false;
            
            const now = new Date();
            const due = new Date(task.due_datetime);
            const timeDiff = due - now;
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            // Task is near overdue if it's due within 24 hours but not yet overdue
            return hoursDiff > 0 && hoursDiff <= 24;
        }).length;
    },

    // Checking if a task is deleted
    hasDeletedTasks: function(tasks) {
        return tasks.some(task => task.deleted_at);
    },

    // Counting deleted tasks
    countDeletedTasks: function(tasks) {
        return tasks.filter(task => task.deleted_at).length;
    },
  },
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// Add session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || '',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

route(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})