const pool = require('../../config/database').pool;
const bcrypt = require('bcrypt');
const { use } = require('react');

class User {
    constructor(id, username, password, avatar, created_at, updated_at) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.avatar = avatar
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static async create(userData) {
        try {
            const { username, password } = userData;
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const [result] = await pool.execute(
                'INSERT INTO users (username, password, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
                [username, hashedPassword]
            );
            
            return result.insertId;
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    static async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            
            if (rows.length === 0) return null;
            
            const user = rows[0];
            return new User(
                user.id,
                user.username,
                user.password,
                user.avatar,
                user.created_at,
                user.updated_at
            );
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            
            if (rows.length === 0) return null;
            
            const user = rows[0];
            return new User(
                user.id,
                user.username,
                user.password,
                user.avatar,
                user.created_at,
                user.updated_at
            );
        } catch (error) {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }

    static async updatePassword(id, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await pool.execute(
                'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
                [hashedPassword, id]
            );
        } catch (error) {
            throw new Error(`Error updating password: ${error.message}`);
        }
    }

    static async updateAvatar(id, avatarPath) {
        try {
            await pool.execute(
                'UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?',
                [avatarPath, id]
            );
        } catch (error) {
            throw new Error(`Error updating avatar: ${error.message}`);
        }
    }

    async validatePassword(password) {
        return await bcrypt.compare(password, this.password);
    }
}

module.exports = User;
