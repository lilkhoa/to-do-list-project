const { pool } = require('../../config/database');

class Task {
    static #queryWithSortAndOrder(query, sort, order) {
        if (sort && order) {
            return `${query} ORDER BY ${pool.escapeId(sort)} ${order.toUpperCase()}`;
        }
        return query;
    }

    // Get all tasks
    static async findAll(userId) {
        try {
            // First update overdue status
            await this.updateOverdueStatus();
            
            const [rows] = await pool.execute(`
                SELECT *,
                    CASE 
                        WHEN completed = TRUE THEN 'completed'
                        WHEN overdue = TRUE THEN 'overdue'
                        ELSE 'pending'
                    END as status
                FROM tasks 
                WHERE user_id = ? AND deleted_at IS NULL
                ORDER BY 
                    CASE 
                        WHEN completed = TRUE THEN 3
                        WHEN overdue = TRUE THEN 1
                        ELSE 2
                    END,
                    CASE 
                        WHEN completed = TRUE THEN updated_at
                    END DESC,
                    CASE 
                        WHEN completed = FALSE THEN due_datetime
                    END ASC
            `, [userId]);
            return rows;
        } catch (error) {
            throw new Error(`Error fetching courses: ${error.message}`);
        }
    }

    // Get all deleted tasks
    static async findAllDeleted(userId) {
        try {
            const [rows] = await pool.execute(`
                SELECT * FROM tasks 
                WHERE user_id = ? AND deleted_at IS NOT NULL
                ORDER BY deleted_at DESC
            `, [userId]);
            return rows;
        } catch (error) {
            throw new Error(`Error fetching trashed tasks: ${error.message}`);
        }
    }

    // Get task by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM tasks WHERE id = ?',
                [id],
            );
            return rows[0];
        } catch (error) {
            throw new Error(`Error fetching course: ${error.message}`);
        }
    }

    // Create new task
    static async create(taskData, userId) {
        try {
            const { title, description, dueDate, dueTime } = taskData;
            
            // Combine date and time into a datetime string
            let dueDateTime = null;
            if (dueDate && dueTime) {
                dueDateTime = `${dueDate} ${dueTime}:00`;
            } else if (dueDate) {
                dueDateTime = `${dueDate} 23:59:59`;
            }
            
            const [result] = await pool.execute(
                'INSERT INTO tasks (title, description, due_datetime, user_id) VALUES (?, ?, ?, ?)',
                [title, description, dueDateTime, userId],
            );
            return result.insertId;
        } catch (error) {
            throw new Error(`Error creating task: ${error.message}`);
        }
    }

    // Update task
    static async update(id, taskData) {
        try {
            const { title, description, dueDate, dueTime } = taskData;
            
            // Combine date and time into a datetime string
            let dueDateTime = null;
            if (dueDate && dueTime) {
                dueDateTime = `${dueDate} ${dueTime}:00`;
            } else if (dueDate) {
                dueDateTime = `${dueDate} 23:59:59`;
            }
            
            const [result] = await pool.execute(
                'UPDATE tasks SET title = ?, description = ?, due_datetime = ? WHERE id = ?',
                [title, description, dueDateTime, id],
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating task: ${error.message}`);
        }
    }

    // Mark task as complete
    static async complete(id) {
        try {
            const [result] = await pool.execute(
                'UPDATE tasks SET completed = 1 WHERE id = ?',
                [id],
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error completing task: ${error.message}`);
        }
    }

    // Mark task as incomplete
    static async incomplete(id) {
        try {
            const [result] = await pool.execute(
                'UPDATE tasks SET completed = 0 WHERE id = ?',
                [id],
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error marking task as incomplete: ${error.message}`);
        }
    }

    static async updateOverdueStatus() {
        try {
            const [result] = await pool.execute(`
                UPDATE tasks 
                SET overdue = CASE 
                    WHEN due_datetime < NOW() AND completed = FALSE THEN TRUE 
                    ELSE FALSE 
                END
            `);
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Error updating overdue status: ${error.message}`);
        }
    }

    static async restore(id) {
        try {
            const [result] = await pool.execute(
                'UPDATE tasks SET deleted_at = NULL WHERE id = ?',
                [id],
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error restoring task: ${error.message}`);
        }
    }

    // Soft delete task
    static async delete(id) {
        try {
            const [result] = await pool.execute(
                'UPDATE tasks SET deleted_at = NOW() WHERE id = ?',
                [id],
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting task: ${error.message}`);
        }
    }

    // Permanently delete task
    static async permanentDelete(id) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM tasks WHERE id = ?',
                [id],
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error permanently deleting task: ${error.message}`);
        }
    }

    // Empty trash (delete all tasks marked as deleted)
    static async emptyTrash(userId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM tasks WHERE user_id = ? AND deleted_at IS NOT NULL',
                [userId],
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error emptying trash: ${error.message}`);
        }
    }

    // Bulk complete tasks
    static async bulkComplete(taskIds) {
        try {
            const placeholders = taskIds.map(() => '?').join(',');
            const [result] = await pool.execute(
                `UPDATE tasks SET completed = 1 WHERE id IN (${placeholders})`,
                taskIds,
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error bulk completing tasks: ${error.message}`);
        }
    }

    // Bulk incomplete tasks
    static async bulkIncomplete(taskIds) {
        try {
            const placeholders = taskIds.map(() => '?').join(',');
            const [result] = await pool.execute(
                `UPDATE tasks SET completed = 0 WHERE id IN (${placeholders})`,
                taskIds,
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error bulk marking tasks as incomplete: ${error.message}`);
        }
    }

    // Bulk delete tasks
    static async bulkDelete(taskIds) {
        try {
            const placeholders = taskIds.map(() => '?').join(',');
            const [result] = await pool.execute(
                `UPDATE tasks SET deleted_at = NOW() WHERE id IN (${placeholders})`,
                taskIds,
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error bulk deleting tasks: ${error.message}`);
        }
    }
}

module.exports = Task;
