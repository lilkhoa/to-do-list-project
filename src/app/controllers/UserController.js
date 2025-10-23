const User = require('../models/User'); 
const Task = require('../models/Task');

class UserController {

    // [GET] /profile
    async profile(req, res, next) {
        try {
            const userId = req.session.user?.id;
            if (!userId) {
                return res.redirect('/auth/login');
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).render('error', { message: 'User not found' });
            }

            // Get user's task statistics
            const userTasks = await Task.findAll(userId);
            const totalTasks = userTasks.length;
            const completedTasks = userTasks.filter(task => task.completed).length;
            const overdueTasks = userTasks.filter(task => task.overdue).length;
            const pendingTasks = totalTasks - completedTasks - overdueTasks;
            
            // Get recent tasks (last 5)
            const recentTasks = userTasks.slice(0, 5);

            res.render('user/profile', { 
                title: 'My Profile',
                user,
                totalTasks,
                completedTasks,
                pendingTasks,
                recentTasks,
            });
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }

    // [PUT] /profile/update/change-password
    async changePassword(req, res) {
        try {
            const userId = req.session.user?.id;
            if (!userId) {
                return res.redirect('/auth/login');
            }

            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.redirect('/user/profile?error=Please fill in all fields');
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).render('error', { message: 'User not found' });
            }

            const isValidPassword = await user.validatePassword(currentPassword);
            if (!isValidPassword) {
                return res.redirect('/user/profile?password-error=Current password is incorrect');
            }

            await User.updatePassword(userId, newPassword);
            res.redirect('/user/profile?password-success=true');
        } catch (error) {
            console.error('Error changing password:', error);
        }
    }

    // [PUT] /profile/update/change-avatar
    async changeAvatar(req, res) {
        try {
            const userId = req.session.user?.id;
            if (!userId) {
                return res.redirect('/auth/login');
            }

            if (!req.file) {
                return res.redirect('/user/profile?avatar-error=Please upload an avatar image');
            }

            const avatarPath = `/img/user-avatar/${req.file.filename}`;
            await User.updateAvatar(userId, avatarPath);

            // Update session user data
            req.session.user.avatar = avatarPath;

            res.redirect('/user/profile?avatar-success=true');
        } catch (error) {
            console.error('Error changing avatar:', error);
        }
    }
}

module.exports = new UserController();
