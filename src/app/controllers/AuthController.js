const User = require('../models/User');

class AuthController {
    // [GET] /login
    showLogin(req, res) {
        if (req.session.user) {
            return res.redirect('/task'); // Redirect to task list if already logged in
        }
        res.render('auth/login', { 
            title: 'Login',
            error: req.query.error 
        });
    }

    // [POST] /login
    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.redirect('/auth/login?error=Please fill in all fields');
            }

            const user = await User.findByUsername(username);
            if (!user) {
                return res.redirect('/auth/login?error=Invalid username or password');
            }

            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.redirect('/auth/login?error=Invalid username or password');
            }

            // Set user session
            req.session.user = {
                id: user.id,
                username: user.username,
                avatar: user.avatar || null,
            };

            res.redirect('/task');
        } catch (error) {
            console.error('Login error:', error);
            next();
        }
    }

    // [GET] /register
    showRegister(req, res) {
        res.render('auth/register');
    }

    // [POST] /register
    async register(req, res) {
        try {
            const { username, password, confirmPassword } = req.body;

            if (!username || !password || !confirmPassword) {
                return res.redirect('/auth/register?error=Please fill in all fields');
            }

            const usernamePattern = /^[a-zA-Z0-9]{3,20}$/;
            if (!usernamePattern.test(username)) {
                return res.redirect('/auth/register?error=Username must be 3-20 characters long and can only contain letters and numbers');
            }

            if (password !== confirmPassword) {
                return res.redirect('/auth/register?error=Passwords do not match');
            }

            if (password.length < 6) {
                return res.redirect('/auth/register?error=Password must be at least 6 characters');
            }

            // Check if user already exists
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.redirect('/auth/register?error=Username already exists');
            }

            // Create new user
            await User.create({ username, password });

            return res.redirect('/auth/register?success=Registration successful, please log in');
        } catch (error) {
            console.error('Registration error:', error);
            next();
        }
    }

    // [POST] /logout
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/auth/login');
        });
    }
}

module.exports = new AuthController();
