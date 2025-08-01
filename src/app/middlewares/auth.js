// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

// Middleware to pass user to all views
const setUser = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};

module.exports = { requireAuth, setUser };
