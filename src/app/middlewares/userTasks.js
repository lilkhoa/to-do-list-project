const Task = require('../models/Task');

// Middleware to fetch user tasks for notifications
const fetchUserTasks = async (req, res, next) => {
    try {
        if (req.session.user) {
            const userId = req.session.user.id;
            const tasks = await Task.findAll(userId);
            
            res.locals.tasks = tasks;
        } else {
            res.locals.tasks = [];
        }
        
        next();
    } catch (error) {
        console.error('Error fetching user tasks for notifications:', error);
        res.locals.tasks = [];
        next();
    }
};

module.exports = { fetchUserTasks };
