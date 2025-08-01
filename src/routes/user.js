const express = require('express');
const router = express.Router();
const userController = require('../app/controllers/UserController');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/img/user-avatar'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `avatar_${req.session.user.id}${ext}`;
        cb(null, filename);
    }
});
const upload = multer({ storage });


// Define routes for the site
router.get('/profile', userController.profile); // User profile route

// Change user profile information
router.put('/profile/update/change-password', userController.changePassword); // Change password
router.put('/profile/update/change-avatar', upload.single('avatar'), userController.changeAvatar); // Change avatar

module.exports = router;
