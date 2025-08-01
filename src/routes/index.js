const siteRouter = require('./site');
const taskRouter = require('./task');
const authRouter = require('./auth');
const userRouter = require('./user');
const { requireAuth, setUser } = require('../app/middlewares/auth');
const { fetchUserTasks } = require('../app/middlewares/userTasks');

function route(app) {
    app.use('/task', requireAuth, setUser, fetchUserTasks, taskRouter); // Task routes
    app.use('/auth', authRouter); // Authentication routes
    app.use('/user', requireAuth, setUser, fetchUserTasks, userRouter); // User routes
    app.use('/', setUser, fetchUserTasks, siteRouter); // Default route for the site
}

module.exports = route;
